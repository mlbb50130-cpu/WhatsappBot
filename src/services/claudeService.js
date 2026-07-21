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
    throw new Error('ANTHROPIC_API_KEY manquant (configure-le dans le .env).');
  }
  client = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
    baseURL: config.ANTHROPIC_BASE_URL,
  });
  return client;
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

  // Streaming: recommande pour les sorties potentiellement longues (evite les timeouts).
  const stream = c.messages.stream({
    model: config.ANTHROPIC_MODEL,
    max_tokens: 64000,
    messages: [{ role: 'user', content: question }],
  });

  const message = await stream.finalMessage();
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

module.exports = { askAndSave, slugify, OUTPUT_DIR };
