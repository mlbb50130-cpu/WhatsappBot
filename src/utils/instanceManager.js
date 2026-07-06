// Gestionnaire d'instances WhatsApp supplementaires (multi-tenant).
//
// La session principale (proprietaire du deploiement) reste geree par index.js
// et PERSISTANTE. Ici on cree des sessions ADDITIONNELLES, une par numero lie
// via l'app. Elles sont EPHEMERES (dossier ./instances/<numero>, non persiste
// au redeploiement) : apres un redeploiement, l'utilisateur relie son compte.
//
// Chaque socket reutilise le meme handler que le bot principal, avec son propre
// prefixe (sock.instancePrefix) et son propre proprietaire (son numero).

const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const INSTANCES_DIR = path.join(process.cwd(), 'instances');

// Duree de vie max d'une instance ephemere: 2 jours. Au-dela, elle est arretee.
const INSTANCE_TTL_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_RECONNECTS = 8;

// digits -> inst { sock, status, pairingCode, connectedAt, createdAt, prefix, phone, stopped, reconnects }
const instances = new Map();

let cleanupTimer = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [digits, inst] of instances) {
      if (now - (inst.createdAt || now) > INSTANCE_TTL_MS) {
        removeInstance(digits).catch(() => {});
      }
    }
  }, 60 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

function digitsOf(phone) {
  return String(phone || '').replace(/\D/g, '');
}

async function requestPairingWithRetry(sock, digits, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const code = await sock.requestPairingCode(digits);
      if (code) return code;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('pairing code indisponible');
}

function publicState(inst) {
  if (!inst) return null;
  return {
    phone: inst.phone,
    status: inst.status, // starting | pairing | connecting | connected | disconnected | error
    connected: inst.status === 'connected',
    pairingCode: inst.pairingCode || null,
    connectedAt: inst.connectedAt || null,
    createdAt: inst.createdAt || null,
    expiresAt: inst.createdAt ? inst.createdAt + INSTANCE_TTL_MS : null,
    prefix: inst.prefix || '!',
    error: inst.error || null,
  };
}

// Cree la socket, attache les handlers et gere la RECONNEXION.
// Apres l'appairage, Baileys ferme avec restartRequired (515): il faut recreer
// la socket pour que l'instance passe reellement en ligne.
async function startSocket(inst) {
  const digits = inst.phone;
  const dir = path.join(INSTANCES_DIR, digits);
  fs.mkdirSync(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    printQRInTerminal: false,
  });
  inst.sock = sock;
  sock.instancePhone = digits;
  sock.instancePrefix = inst.prefix;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting' && inst.status !== 'pairing') {
      inst.status = 'connecting';
    }

    if (connection === 'open') {
      inst.status = 'connected';
      inst.connectedAt = Date.now();
      inst.pairingCode = null;
      inst.error = null;
      inst.reconnects = 0;
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (inst.stopped || code === DisconnectReason.loggedOut || code === 401) {
        // Deconnecte cote WhatsApp / arret volontaire: on nettoie.
        if (!inst.stopped) removeInstance(digits).catch(() => {});
        return;
      }

      // Toute autre fermeture (restartRequired 515, connexion perdue...) -> reconnexion.
      inst.reconnects = (inst.reconnects || 0) + 1;
      if (inst.reconnects > MAX_RECONNECTS) {
        inst.status = 'error';
        inst.error = 'trop de reconnexions';
        return;
      }
      inst.status = 'connecting';
      setTimeout(() => {
        if (!inst.stopped) startSocket(inst).catch(() => {});
      }, 2000);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const { handleMessage } = require('../handler');
      const message = m.messages && m.messages[0];
      if (!message || !message.message) return;
      const senderJid = message.key.remoteJid;
      if (!senderJid) return;
      const isGroup = senderJid.endsWith('@g.us');
      let groupData = null;
      if (isGroup) {
        groupData = await sock.groupMetadata(senderJid).catch(() => null);
      }
      await handleMessage(sock, message, isGroup, groupData);
    } catch (err) {
      // ignore par message
    }
  });

  // Pairing code uniquement au premier lancement (numero pas encore enregistre).
  if (!sock.authState.creds.registered) {
    inst.status = 'pairing';
    try {
      inst.pairingCode = await requestPairingWithRetry(sock, digits);
      inst.error = null;
    } catch (err) {
      inst.status = 'error';
      inst.error = err && err.message ? err.message : String(err);
    }
  }

  return sock;
}

async function createInstance(phone, prefix = '!') {
  ensureCleanup();
  const digits = digitsOf(phone);
  if (digits.length < 8) throw new Error('Numero invalide');

  const existing = instances.get(digits);
  if (existing && existing.status !== 'error' && existing.status !== 'disconnected') {
    return publicState(existing);
  }

  const inst = {
    sock: null,
    status: 'starting',
    pairingCode: null,
    connectedAt: null,
    createdAt: Date.now(),
    prefix: (prefix || '!').slice(0, 3) || '!',
    phone: digits,
    stopped: false,
    reconnects: 0,
    error: null,
  };
  instances.set(digits, inst);

  await startSocket(inst);
  return publicState(inst);
}

function getInstance(phone) {
  return publicState(instances.get(digitsOf(phone)));
}

function setPrefix(phone, prefix) {
  const inst = instances.get(digitsOf(phone));
  if (!inst) return null;
  inst.prefix = (prefix || '!').slice(0, 3) || '!';
  if (inst.sock) inst.sock.instancePrefix = inst.prefix;
  return publicState(inst);
}

async function removeInstance(phone) {
  const digits = digitsOf(phone);
  const inst = instances.get(digits);
  if (!inst) return false;
  inst.stopped = true;
  try { await inst.sock?.logout(); } catch (e) { /* ignore */ }
  try { await inst.sock?.end(); } catch (e) { /* ignore */ }
  instances.delete(digits);
  try { fs.rmSync(path.join(INSTANCES_DIR, digits), { recursive: true, force: true }); } catch (e) { /* ignore */ }
  return true;
}

function listInstances() {
  return Array.from(instances.values()).map(publicState);
}

module.exports = {
  createInstance,
  getInstance,
  setPrefix,
  removeInstance,
  listInstances,
};
