const fs = require('fs');

const MAX_MESSAGE_LENGTH = 3200;

function splitMessage(text, maxLength = MAX_MESSAGE_LENGTH) {
  const remainingChunks = [];
  let remaining = String(text || '').trim();

  while (remaining.length > maxLength) {
    const window = remaining.slice(0, maxLength + 1);
    let splitAt = Math.max(window.lastIndexOf('\n\n'), window.lastIndexOf('\n'));
    if (splitAt < Math.floor(maxLength / 2)) splitAt = window.lastIndexOf(' ');
    if (splitAt < Math.floor(maxLength / 2)) splitAt = maxLength;

    remainingChunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining || remainingChunks.length === 0) {
    remainingChunks.push(remaining || '(reponse vide)');
  }
  return remainingChunks;
}

async function sendAiResponse({ sock, jid, askerJid, provider, result }) {
  const mention = `@${askerJid.split('@')[0]}`;

  if (result.filePath && result.fileName) {
    await sock.sendMessage(jid, {
      document: fs.readFileSync(result.filePath),
      fileName: result.fileName,
      mimetype: result.mimetype || 'text/plain',
      caption: `${mention} ${provider} - ${result.fileName}`,
      mentions: [askerJid],
    });
    return;
  }

  const chunks = splitMessage(result.text);
  for (let index = 0; index < chunks.length; index += 1) {
    const firstChunk = index === 0;
    await sock.sendMessage(jid, {
      text: firstChunk
        ? `${mention} Reponse de ${provider}:\n\n${chunks[index]}`
        : chunks[index],
      mentions: firstChunk ? [askerJid] : [],
    });
  }
}

module.exports = { sendAiResponse, splitMessage };
