const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

// Dossier ou sont ecrits les fichiers generes par l'IA.
const OUTPUT_DIR = path.join(process.cwd(), 'ia_outputs');

let client = null;
function getClient() {
  if (client) return client;
  if (!config.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY manquant (configure-le dans le .env / variables Railway).');
  }
  client = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
    baseURL: config.ANTHROPIC_BASE_URL,
  });
  return client;
}

// Extrait un message d'erreur REEL et lisible depuis une erreur du SDK Anthropic.
function describeError(err) {
  if (!err) return 'erreur inconnue';
  const parts = [];
  if (err.status) parts.push(`HTTP ${err.status}`);
  // Le SDK expose souvent err.error.error.{type,message} (corps renvoye par l'API)
  const apiErr = err.error?.error || err.error;
  if (apiErr?.type) parts.push(apiErr.type);
  const msg = apiErr?.message || err.message;
  if (msg) parts.push(msg);
  if (err.request_id) parts.push(`req ${err.request_id}`);
  return parts.length ? parts.join(' | ') : String(err);
}

// Transforme la question en nom de fichier sur (sans caracteres interdits).
function slugify(question) {
  const base = String(question || 'reponse')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'reponse';
}

/**
 * Demande a Claude de repondre a `question`, ecrit la reponse dans un fichier
 * nomme d'apres la question, et renvoie { text, filePath, fileName }.
 */
async function askAndSave(question) {
  const c = getClient();

  let message;
  try {
    // Streaming: recommande pour les sorties potentiellement longues (evite les timeouts).
    const stream = c.messages.stream({
      model: config.ANTHROPIC_MODEL,
      max_tokens: 64000,
      messages: [{ role: 'user', content: question }],
    });
    message = await stream.finalMessage();
  } catch (err) {
    // Remonte l'erreur REELLE (statut HTTP + type + message de l'API)
    const detailed = new Error(describeError(err));
    detailed.cause = err;
    throw detailed;
  }

  // Refus de securite: HTTP 200 mais stop_reason "refusal" -> pas de contenu exploitable
  if (message.stop_reason === 'refusal') {
    const cat = message.stop_details?.category ? ` (${message.stop_details.category})` : '';
    throw new Error(`La requete a ete refusee par l'IA${cat}.`);
  }

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const fileName = `${slugify(question)}.txt`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const header = `Question: ${question}\n${'='.repeat(60)}\n\n`;
  fs.writeFileSync(filePath, header + (text || '(reponse vide)') + '\n', 'utf8');

  return { text, filePath, fileName };
}

module.exports = { askAndSave, slugify, describeError, OUTPUT_DIR };
