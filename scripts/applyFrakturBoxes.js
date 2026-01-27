const fs = require('fs');
const path = require('path');

// Fraktur character mapping
const frakturMap = {
  'A': '𝔄', 'B': '𝔅', 'C': '𝔆', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊',
  'H': '𝔋', 'I': '𝔌', 'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑',
  'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': '𝔕', 'S': '𝔖', 'T': '𝔗', 'U': '𝔘',
  'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': '𝔝',
  'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤',
  'h': '𝔥', 'i': '𝔦', 'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫',
  'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱', 'u': '𝔲',
  'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
  '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞',
  '7': '𝟟', '8': '𝟠', '9': '𝟡'
};

function toFraktur(text) {
  return text.split('').map(char => frakturMap[char] || char).join('');
}

const commandsDir = path.join(__dirname, '../src/commands');
const files = fs.readdirSync(commandsDir)
  .filter(f => f.endsWith('.js') && f !== 'documentation.js');

const processed = [];
const skipped = [];

files.forEach(file => {
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Look for line with just a title/header (usually near top of execute function)
  // Pattern: ╔═══... (ASCII box) or \*TITLE\* or == TITLE == or just 'TITLE' in a context
  
  // Find lines that look like titles:
  const lines = content.split('\n');
  let hasTitle = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for ║ TITLE ║ pattern (box drawing)
    if (/║\s+[\w\s]+\s+║/.test(line)) {
      const match = line.match(/║\s+([\w\s⚡💪🔴🔵💜🛻🌙🎬👁️❓🎮😂⚔️🐍🍀💚📋😍🌑🔴💕🎯⚡💗📝🥰🔵😿⚔️🗡️💜💪⚡🔥]+)\s+║/);
      if (match && match[1] && match[1].length > 2) {
        const title = match[1].trim();
        const hasFraktur = Object.values(frakturMap).some(fc => title.includes(fc));
        if (!hasFraktur) {
          const newTitle = toFraktur(title);
          lines[i] = line.replace(title, newTitle);
          console.log(`✅ ${file} (line ${i+1}): "${title}" → "${newTitle}"`);
          hasTitle = true;
        }
      }
    }
  }
  
  if (hasTitle) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    processed.push(file);
  } else {
    skipped.push(file);
  }
});

console.log(`\n📊 Summary: ${processed.length} files with title boxes found`);
if (skipped.length > 0) {
  console.log(`⏭️  Remaining: ${skipped.length} files without title boxes (likely don't need Fraktur)`);
}
