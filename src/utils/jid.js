function getLidMap() {
  if (!global.lidToJidMap) {
    global.lidToJidMap = new Map();
  }
  return global.lidToJidMap;
}

function cleanJid(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const compact = raw.replace(/\s+/g, '').replace(/^\+/, '');
  const atIndex = compact.indexOf('@');

  if (atIndex >= 0) {
    const local = compact.slice(0, atIndex).split(':')[0];
    const domain = compact.slice(atIndex + 1).toLowerCase();
    return local && domain ? `${local}@${domain}` : compact;
  }

  const number = compact.replace(/\D/g, '');
  return number ? `${number}@s.whatsapp.net` : compact;
}

function jidDigits(value = '') {
  const jid = cleanJid(value);
  if (jid.endsWith('@lid')) return '';
  return jid.split('@')[0].replace(/\D/g, '');
}

function flattenValues(values, output = []) {
  for (const value of values) {
    if (Array.isArray(value)) {
      flattenValues(value, output);
    } else if (typeof value === 'string' || typeof value === 'number') {
      output.push(value);
    }
  }
  return output;
}

function uniqueJids(...values) {
  const result = [];
  const seen = new Set();
  const lidMap = global.lidToJidMap instanceof Map ? global.lidToJidMap : null;

  for (const value of flattenValues(values)) {
    const cleaned = cleanJid(value);
    if (!cleaned || seen.has(cleaned)) continue;

    seen.add(cleaned);
    result.push(cleaned);

    const mapped = lidMap?.get(cleaned);
    const cleanedMapped = mapped ? cleanJid(mapped) : '';
    if (cleanedMapped && !seen.has(cleanedMapped)) {
      seen.add(cleanedMapped);
      result.push(cleanedMapped);
    }
  }

  return result;
}

function jidMatches(left, right) {
  const leftJids = uniqueJids(left);
  const rightJids = uniqueJids(right);

  if (leftJids.some((jid) => rightJids.includes(jid))) return true;

  const leftDigits = leftJids.map(jidDigits).filter(Boolean);
  const rightDigits = rightJids.map(jidDigits).filter(Boolean);
  return leftDigits.some((digits) => rightDigits.includes(digits));
}

function rememberJidPair(first, second) {
  const firstJid = cleanJid(first);
  const secondJid = cleanJid(second);
  if (!firstJid || !secondJid || firstJid === secondJid) return;

  const firstIsLid = firstJid.endsWith('@lid');
  const secondIsLid = secondJid.endsWith('@lid');
  const firstIsPhone = firstJid.endsWith('@s.whatsapp.net');
  const secondIsPhone = secondJid.endsWith('@s.whatsapp.net');

  if (!((firstIsLid && secondIsPhone) || (secondIsLid && firstIsPhone))) return;

  const lidMap = getLidMap();
  lidMap.set(firstJid, secondJid);
  lidMap.set(secondJid, firstJid);
}

function participantJids(participant = {}) {
  if (!participant || typeof participant !== 'object') return uniqueJids(participant);

  const values = [
    participant.id,
    participant.jid,
    participant.lid,
    participant.phoneNumber,
  ].filter(Boolean);

  const lid = values.find((value) => cleanJid(value).endsWith('@lid'));
  const phone = values.find((value) => cleanJid(value).endsWith('@s.whatsapp.net'));
  rememberJidPair(lid, phone);

  return uniqueJids(values);
}

function rememberContactIdentity(contact = {}) {
  if (!contact || typeof contact !== 'object') return;
  const values = [contact.id, contact.jid, contact.lid, contact.phoneNumber].filter(Boolean);
  const lid = values.find((value) => cleanJid(value).endsWith('@lid'));
  const phone = values.find((value) => cleanJid(value).endsWith('@s.whatsapp.net'));
  rememberJidPair(lid, phone);
}

function findParticipant(participants = [], target) {
  if (!Array.isArray(participants) || participants.length === 0) return null;

  for (const participant of participants) {
    const candidates = participantJids(participant);
    if (jidMatches(candidates, target)) return participant;
  }

  return null;
}

function messageSenderJids(message = {}, participants = []) {
  const key = message?.key || {};
  const values = [
    key.participant,
    key.participantAlt,
    key.senderPn,
    key.senderLid,
    key.userJid,
    key.remoteJid && !String(key.remoteJid).endsWith('@g.us') ? key.remoteJid : '',
    key.remoteJidAlt,
  ].filter(Boolean);

  rememberJidPair(key.participant, key.participantAlt);
  rememberJidPair(key.senderLid, key.senderPn);

  const participant = findParticipant(participants, values);
  return uniqueJids(values, participantJids(participant));
}

function rememberMessageIdentity(message = {}, participants = []) {
  messageSenderJids(message, participants);
}

module.exports = {
  cleanJid,
  findParticipant,
  jidDigits,
  jidMatches,
  messageSenderJids,
  participantJids,
  rememberContactIdentity,
  rememberJidPair,
  rememberMessageIdentity,
  uniqueJids,
};
