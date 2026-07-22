const path = require('path');

const FORMAT_DEFINITIONS = [
  { extension: 'html', mimetype: 'text/html', aliases: ['html', 'htm'] },
  { extension: 'css', mimetype: 'text/css', aliases: ['css'] },
  { extension: 'js', mimetype: 'text/javascript', aliases: ['javascript', 'node.js', 'nodejs', 'js'] },
  { extension: 'ts', mimetype: 'text/typescript', aliases: ['typescript', 'ts'] },
  { extension: 'jsx', mimetype: 'text/javascript', aliases: ['jsx', 'react jsx'] },
  { extension: 'tsx', mimetype: 'text/typescript', aliases: ['tsx', 'react tsx'] },
  { extension: 'json', mimetype: 'application/json', aliases: ['json'] },
  { extension: 'py', mimetype: 'text/x-python', aliases: ['python', 'py'] },
  { extension: 'c', mimetype: 'text/x-c', aliases: ['langage c', 'c'] },
  { extension: 'cpp', mimetype: 'text/x-c++src', aliases: ['c++', 'cpp', 'cxx'] },
  { extension: 'cs', mimetype: 'text/x-csharp', aliases: ['c sharp', 'csharp', 'c#', 'cs'] },
  { extension: 'java', mimetype: 'text/x-java-source', aliases: ['java'] },
  { extension: 'kt', mimetype: 'text/x-kotlin', aliases: ['kotlin', 'kt'] },
  { extension: 'go', mimetype: 'text/x-go', aliases: ['golang', 'go'] },
  { extension: 'rs', mimetype: 'text/x-rust', aliases: ['rust', 'rs'] },
  { extension: 'php', mimetype: 'application/x-httpd-php', aliases: ['php'] },
  { extension: 'rb', mimetype: 'text/x-ruby', aliases: ['ruby', 'rb'] },
  { extension: 'swift', mimetype: 'text/x-swift', aliases: ['swift'] },
  { extension: 'dart', mimetype: 'text/x-dart', aliases: ['dart'] },
  { extension: 'lua', mimetype: 'text/x-lua', aliases: ['lua'] },
  { extension: 'r', mimetype: 'text/x-r', aliases: ['langage r', 'r'] },
  { extension: 'scala', mimetype: 'text/x-scala', aliases: ['scala'] },
  { extension: 'sh', mimetype: 'application/x-sh', aliases: ['shell', 'bash', 'sh'] },
  { extension: 'ps1', mimetype: 'text/plain', aliases: ['powershell', 'ps1'] },
  { extension: 'sql', mimetype: 'application/sql', aliases: ['sql'] },
  { extension: 'xml', mimetype: 'application/xml', aliases: ['xml'] },
  { extension: 'yaml', mimetype: 'application/yaml', aliases: ['yaml', 'yml'] },
  { extension: 'toml', mimetype: 'application/toml', aliases: ['toml'] },
  { extension: 'ini', mimetype: 'text/plain', aliases: ['ini'] },
  { extension: 'md', mimetype: 'text/markdown', aliases: ['markdown', 'md'] },
  { extension: 'vue', mimetype: 'text/plain', aliases: ['vue.js', 'vuejs', 'vue'] },
  { extension: 'svelte', mimetype: 'text/plain', aliases: ['svelte'] },
  { extension: 'csv', mimetype: 'text/csv', aliases: ['csv'] },
  { extension: 'txt', mimetype: 'text/plain', aliases: ['texte brut', 'text', 'txt'] },
  { extension: 'cob', mimetype: 'text/plain', aliases: ['cobol'] },
  { extension: 'f90', mimetype: 'text/plain', aliases: ['fortran'] },
  { extension: 'asm', mimetype: 'text/plain', aliases: ['assembleur', 'assembly', 'asm'] },
  { extension: 'groovy', mimetype: 'text/plain', aliases: ['groovy'] },
  { extension: 'pl', mimetype: 'text/x-perl', aliases: ['perl'] },
  { extension: 'sol', mimetype: 'text/plain', aliases: ['solidity'] },
];

const FORMAT_BY_EXTENSION = new Map(
  FORMAT_DEFINITIONS.map((format) => [format.extension, format]),
);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function escapeRegex(value) {
  return value
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
}

function isRequestedAlias(question, alias) {
  const text = normalize(question);
  const aliasSource = escapeRegex(normalize(alias));
  const aliasEnd = '(?=$|[^a-z0-9+#])';
  const patterns = [
    `^\\s*\\.?${aliasSource}${aliasEnd}`,
    `(^|[^a-z0-9])en\\s+(?:langage\\s+)?\\.?${aliasSource}${aliasEnd}`,
    `(^|[^a-z0-9])(?:langage|language|format|extension)\\s*(?::|=)?\\s*\\.?${aliasSource}${aliasEnd}`,
    `(^|[^a-z0-9])(?:fichier|file|code|script|page|programme|program)\\s+(?:(?:source|en|de|au\\s+format)\\s+)?\\.?${aliasSource}${aliasEnd}`,
    `(^|[^a-z0-9])(?:cree|creer|genere|generer|ecris|ecrire|produis|produire|fais|faire)\\s+(?:moi\\s+)?(?:(?:un|une|du|de\\s+la)\\s+)?(?:(?:fichier|file|code|script|page|programme|program)\\s+)?(?:(?:en|au\\s+format)\\s+)?\\.?${aliasSource}${aliasEnd}`,
  ];

  return patterns.some((pattern) => new RegExp(pattern, 'i').test(text));
}

function findRequestedFileName(question) {
  const match = String(question || '').match(
    /(?:^|[\s"'`(])([a-z0-9][a-z0-9._-]{0,80}\.([a-z][a-z0-9]{0,9}))(?=$|[\s"'`),;:])/i,
  );
  if (!match) return null;

  const extension = normalize(match[2]);
  if (!FORMAT_BY_EXTENSION.has(extension)) return null;
  return { fileName: match[1], extension };
}

function findExplicitCustomExtension(question) {
  const text = normalize(question);
  const extensionMatch = text.match(
    /\b(?:extension|format)\s*(?:de\s+fichier\s*)?(?::|=)?\s*\.([a-z][a-z0-9]{0,9})\b/,
  );
  if (extensionMatch) return extensionMatch[1];

  const fileMatch = text.match(
    /\b(?:fichier|file)\s+(?:nomme\s+|appele\s+)?[a-z0-9][a-z0-9._-]{0,80}\.([a-z][a-z0-9]{0,9})\b/,
  );
  return fileMatch ? fileMatch[1] : null;
}

function detectRequestedFormat(question) {
  const requestedFile = findRequestedFileName(question);
  if (requestedFile) {
    return {
      ...FORMAT_BY_EXTENSION.get(requestedFile.extension),
      requestedFileName: requestedFile.fileName,
    };
  }

  for (const format of FORMAT_DEFINITIONS) {
    const aliases = [...format.aliases].sort((a, b) => b.length - a.length);
    if (aliases.some((alias) => isRequestedAlias(question, alias))) {
      return { ...format, requestedFileName: null };
    }
  }

  const customExtension = findExplicitCustomExtension(question);
  if (!customExtension) return null;
  return {
    extension: customExtension,
    mimetype: 'text/plain',
    aliases: [customExtension],
    requestedFileName: null,
  };
}

function sanitizeFileName(fileName) {
  return path.basename(String(fileName || ''))
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[.-]+/, '')
    .slice(0, 100);
}

function createOutputFileName(question, format, slugify) {
  const requested = sanitizeFileName(format?.requestedFileName);
  if (requested && requested.toLowerCase().endsWith(`.${format.extension}`)) {
    return requested;
  }

  return `${slugify(question)}.${format.extension}`;
}

function buildGenerationPrompt(question, format) {
  if (!format) return String(question || '');

  return [
    `Produis le contenu d'un fichier .${format.extension} qui repond a la demande ci-dessous.`,
    'Reponds uniquement avec le contenu brut et directement utilisable du fichier.',
    'N ajoute aucune explication, aucun commentaire, aucun titre et aucune phrase avant ou apres le contenu.',
    'N execute aucune commande, ne lis aucun fichier local et ne modifie rien.',
    'N utilise pas de bloc Markdown ni de delimitateurs ```.',
    'Utilise la meme langue que la demande lorsque le contenu contient du texte visible.',
    '',
    `Demande: ${question}`,
  ].join('\n');
}

function stripWrappingCodeFence(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);
  return match ? match[1].trim() : trimmed;
}

module.exports = {
  buildGenerationPrompt,
  createOutputFileName,
  detectRequestedFormat,
  stripWrappingCodeFence,
};
