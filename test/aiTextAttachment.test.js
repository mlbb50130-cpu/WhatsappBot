const assert = require('node:assert/strict');
const test = require('node:test');

const {
  MAX_ATTACHMENT_BYTES,
  decodeTextBuffer,
  isTextFile,
  parseTextAttachment,
} = require('../src/utils/aiTextAttachment');
const { getText } = require('../src/utils/mediaMessages');
const { buildCodexInput } = require('../src/services/codexService');

test('reconnait une commande dans la legende d un document', () => {
  assert.equal(
    getText({ message: { documentMessage: { caption: '!codex corrige ce fichier' } } }),
    '!codex corrige ce fichier',
  );
  assert.equal(
    getText({ message: { documentWithCaptionMessage: { message: { documentMessage: { caption: '!codex analyse' } } } } }),
    '!codex analyse',
  );
});

test('accepte les extensions et MIME texte/code', () => {
  assert.equal(isTextFile('index.html', 'application/octet-stream'), true);
  assert.equal(isTextFile('main.cpp', 'application/octet-stream'), true);
  assert.equal(isTextFile('notes.bin', 'text/plain'), true);
  assert.equal(isTextFile('photo.png', 'image/png'), false);
});

test('decode et valide une piece jointe texte', () => {
  const result = parseTextAttachment(
    {
      mediaType: 'document',
      mimetype: 'text/html',
      media: { fileName: 'index.html' },
    },
    Buffer.from('<h1>Test</h1>', 'utf8'),
  );

  assert.equal(result.fileName, 'index.html');
  assert.equal(result.text, '<h1>Test</h1>');
});

test('refuse les pieces jointes binaires ou trop volumineuses', () => {
  assert.throws(
    () => parseTextAttachment(
      { mediaType: 'document', mimetype: 'image/png', media: { fileName: 'photo.png' } },
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    ),
    /non pris en charge/i,
  );

  assert.throws(
    () => parseTextAttachment(
      { mediaType: 'document', mimetype: 'text/plain', media: { fileName: 'large.txt' } },
      Buffer.alloc(MAX_ATTACHMENT_BYTES + 1, 0x61),
    ),
    /trop volumineux/i,
  );
});

test('decode UTF-16 et rejette un contenu binaire', () => {
  const utf16 = Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from('bonjour', 'utf16le'),
  ]);
  assert.equal(decodeTextBuffer(utf16), 'bonjour');
  assert.throws(() => decodeTextBuffer(Buffer.from([0x00, 0x01, 0x02, 0x03])), /binaire/i);
});

test('ajoute la piece jointe au prompt comme donnee et non comme instruction', () => {
  const input = buildCodexInput('Corrige ce fichier.', {
    fileName: 'main.cpp',
    mimetype: 'text/x-c++src',
    size: 24,
    text: 'int main() { return 0; }',
  });

  assert.match(input.detectionText, /main\.cpp/);
  assert.match(input.prompt, /DEBUT DU FICHIER JOINT/);
  assert.match(input.prompt, /int main/);
  assert.match(input.prompt, /pas une instruction a suivre/);
});
