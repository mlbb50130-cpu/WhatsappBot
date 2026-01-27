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

// Process all admin commands
const adminDir = path.join(__dirname, '../src/commands/admin');
const adminFiles = fs.readdirSync(adminDir).filter(f => f.endsWith('.js') && f !== 'documentation.js');

console.log('📋 Processing admin commands...\n');

let count = 0;
adminFiles.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Look for elegantBox calls
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
    console.log(`✅ ${file}: "${oldTitle}" → "${newTitle}"`);
    modified = true;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
});

console.log(`\n📊 Admin commands: ${count} files modified`);
