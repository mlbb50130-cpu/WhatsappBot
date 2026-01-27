const fs = require('fs');
const path = require('path');

// Fraktur character mapping (full alphabet + numbers)
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

// Get all JS files
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js') && f !== 'documentation.js');

let count = 0;
const replacements = [];

files.forEach(file => {
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find all elegantBox calls with titles
  const elegantBoxRegex = /elegantBox\('([^']+)'/g;
  let match;
  const toReplace = new Set();
  
  while ((match = elegantBoxRegex.exec(content)) !== null) {
    const title = match[1];
    // Skip if already contains any Fraktur character
    const hasFraktur = Object.values(frakturMap).some(frakChar => title.includes(frakChar));
    if (!hasFraktur && title.length > 2) {
      toReplace.add(title);
    }
  }
  
  // Apply replacements
  toReplace.forEach(oldTitle => {
    const newTitle = toFraktur(oldTitle);
    // Replace in elegantBox context
    content = content.replace(
      new RegExp(`elegantBox\\('${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
      `elegantBox('${newTitle}'`
    );
    modified = true;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    toReplace.forEach(title => {
      console.log(`✅ ${file}: "${title}" → "${toFraktur(title)}"`);
    });
    count++;
  }
});

console.log(`\n📊 ${count} fichiers modifiés`);
