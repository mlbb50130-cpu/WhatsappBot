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

function processDirectory(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'documentation.js');
  let total = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: elegantBox('TITLE'
    const elegantBoxRegex = /elegantBox\('([^']+)'/g;
    let match;
    const toReplace = new Set();
    
    while ((match = elegantBoxRegex.exec(content)) !== null) {
      const title = match[1];
      const hasFraktur = Object.values(frakturMap).some(fc => title.includes(fc));
      if (!hasFraktur && title.length > 2) {
        toReplace.add(title);
      }
    }
    
    toReplace.forEach(oldTitle => {
      const newTitle = toFraktur(oldTitle);
      content = content.replace(
        new RegExp(`elegantBox\\('${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
        `elegantBox('${newTitle}'`
      );
      console.log(`  ✅ ${file}: "${oldTitle}" → "${newTitle}"`);
      modified = true;
    });
    
    // Pattern 2: ║ HERO NAME ║ (titles in ASCII boxes)
    const lines = content.split('\n');
    let lineModified = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/║/.test(line) && !line.match(/═════/)) {
        // Extract content between ║ symbols
        const match = line.match(/║\s+(.+?)\s+║/);
        if (match && match[1]) {
          const title = match[1].trim();
          const hasFraktur = Object.values(frakturMap).some(fc => title.includes(fc));
          // Only convert if it contains text letters (not just emojis)
          if (!hasFraktur && /[A-Za-z]/.test(title) && title.length > 2) {
            const newTitle = toFraktur(title);
            lines[i] = line.replace(title, newTitle);
            console.log(`  ✅ ${file} (line ${i+1}): "${title}" → "${newTitle}"`);
            lineModified = true;
          }
        }
      }
    }
    
    if (lineModified) {
      content = lines.join('\n');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      total++;
    }
  });
  
  return total;
}

console.log('📋 Processing all directories...\n');

// Process main commands
console.log('📁 src/commands/');
let mainCount = processDirectory(path.join(__dirname, '../src/commands'));

// Process admin commands
console.log('\n📁 src/commands/admin/');
let adminCount = processDirectory(path.join(__dirname, '../src/commands/admin'));

// Process mlbb commands
console.log('\n📁 src/commands/mlbb/');
let mlbbCount = processDirectory(path.join(__dirname, '../src/commands/mlbb'));

console.log(`\n📊 Total: ${mainCount + adminCount + mlbbCount} directories processed`);
