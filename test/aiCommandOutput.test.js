const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const {
  buildGenerationPrompt,
  createOutputFileName,
  detectRequestedFormat,
  stripWrappingCodeFence,
} = require('../src/utils/aiResponseFormat');
const { sendAiResponse, splitMessage } = require('../src/utils/sendAiResponse');

test('detecte les formats explicitement demandes', () => {
  assert.equal(detectRequestedFormat('cree une page en HTML').extension, 'html');
  assert.equal(detectRequestedFormat('ecris un programme en C++').extension, 'cpp');
  assert.equal(detectRequestedFormat('donne un code en C#').extension, 'cs');
  assert.equal(detectRequestedFormat('genere du CSS').extension, 'css');
});

test('conserve le nom de fichier explicite', () => {
  const format = detectRequestedFormat('cree le fichier Program.cs');
  const fileName = createOutputFileName('cree le fichier Program.cs', format, () => 'reponse');

  assert.equal(format.extension, 'cs');
  assert.equal(fileName, 'Program.cs');
});

test('ne cree pas de format sans demande de sortie explicite', () => {
  assert.equal(detectRequestedFormat('Quelle est la capitale du Japon ?'), null);
  assert.equal(detectRequestedFormat('explique la difference entre C et C++'), null);
});

test('impose une reponse de fichier brute et retire un bloc Markdown externe', () => {
  const format = detectRequestedFormat('cree une page en HTML');
  const prompt = buildGenerationPrompt('cree une page en HTML', format);

  assert.match(prompt, /uniquement avec le contenu brut/i);
  assert.match(prompt, /aucun commentaire/i);
  assert.equal(stripWrappingCodeFence('```html\n<h1>Test</h1>\n```'), '<h1>Test</h1>');
});

test('envoie une reponse normale sans document lorsqu il n y a pas de format', async () => {
  const sent = [];
  const sock = {
    sendMessage: async (jid, payload) => sent.push({ jid, payload }),
  };

  await sendAiResponse({
    sock,
    jid: 'groupe@g.us',
    askerJid: '123@s.whatsapp.net',
    provider: 'Claude',
    result: { text: 'Une reponse simple.', filePath: null, fileName: null },
  });

  assert.equal(sent.length, 1);
  assert.match(sent[0].payload.text, /Une reponse simple/);
  assert.equal(sent[0].payload.document, undefined);
});

test('envoie uniquement le document genere avec son type MIME', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-command-output-'));
  const filePath = path.join(tempDir, 'index.html');
  fs.writeFileSync(filePath, '<h1>Test</h1>', 'utf8');

  try {
    const sent = [];
    const sock = {
      sendMessage: async (jid, payload) => sent.push({ jid, payload }),
    };

    await sendAiResponse({
      sock,
      jid: 'groupe@g.us',
      askerJid: '123@s.whatsapp.net',
      provider: 'Codex',
      result: {
        text: '<h1>Test</h1>',
        filePath,
        fileName: 'index.html',
        mimetype: 'text/html',
      },
    });

    assert.equal(sent.length, 1);
    assert.equal(sent[0].payload.fileName, 'index.html');
    assert.equal(sent[0].payload.mimetype, 'text/html');
    assert.ok(Buffer.isBuffer(sent[0].payload.document));
    assert.equal(sent[0].payload.text, undefined);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('decoupe les longues reponses sans perdre leur contenu utile', () => {
  const chunks = splitMessage('mot '.repeat(2000), 500);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 500));
});
