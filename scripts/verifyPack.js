const fs = require('fs');
const path = require('path');

function readOtakuPackCommands() {
  const text = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'PackManager.js'), 'utf8');
  const match = text.match(/otaku\s*:\s*\[(\s|.|\n)*?\],\s*gamin/s);
  if (!match) {
    throw new Error('Otaku block not found in PackManager.js');
  }
  const block = match[0];
  return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1].toLowerCase());
}

function readCommandNames() {
  const cmdDir = path.join(__dirname, '..', 'src', 'commands');
  const files = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (f.endsWith('.js')) files.push(p);
    }
  })(cmdDir);

  const names = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/module\.exports\s*=\s*\{[\s\S]*?name\s*:\s*['\"]([^'\"]+)['\"]/);
    if (match) names.push(match[1].toLowerCase());
  }
  return [...new Set(names)].sort();
}

try {
  const packCommands = new Set(readOtakuPackCommands());
  const commandNames = readCommandNames();

  const missing = commandNames.filter((name) => !packCommands.has(name) && !['mlbb', 'mlbbmenu'].includes(name));
  console.log('Missing in otaku pack:', missing);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
