const fs = require('fs');
const path = require('path');

// Fraktur to normal mapping  
const frakturToNormal = {
  '𝔄': 'A', '𝔅': 'B', '𝔆': 'C', '𝔇': 'D', '𝔈': 'E', '𝔉': 'F', '𝔊': 'G',
  '𝔋': 'H', '𝔌': 'I', '𝔍': 'J', '𝔎': 'K', '𝔏': 'L', '𝔐': 'M', '𝔑': 'N',
  '𝔒': 'O', '𝔓': 'P', '𝔔': 'Q', '𝔕': 'R', '𝔖': 'S', '𝔗': 'T', '𝔘': 'U',
  '𝔙': 'V', '𝔚': 'W', '𝔛': 'X', '𝔜': 'Y', '𝔝': 'Z',
  '𝔞': 'a', '𝔟': 'b', '𝔠': 'c', '𝔡': 'd', '𝔢': 'e', '𝔣': 'f', '𝔤': 'g',
  '𝔥': 'h', '𝔦': 'i', '𝔧': 'j', '𝔨': 'k', '𝔩': 'l', '𝔪': 'm', '𝔫': 'n',
  '𝔬': 'o', '𝔭': 'p', '𝔮': 'q', '𝔯': 'r', '𝔰': 's', '𝔱': 't', '𝔲': 'u',
  '𝔳': 'v', '𝔴': 'w', '𝔵': 'x', '𝔶': 'y', '𝔷': 'z'
};

function toNormal(text) {
  return text.split('').map(char => frakturToNormal[char] || char).join('');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'documentation.js');
  let totalFixed = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Find template strings with Fraktur characters
    // Pattern: ${ ... } containing Fraktur chars
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for ${...} patterns with Fraktur inside
      const hasFraktur = Object.values(frakturToNormal).some(char => line.includes(frakturToNormal[char]));
      if (hasFraktur && line.includes('${')) {
        let newLine = line;
        // Replace all Fraktur with normal characters
        Object.entries(frakturToNormal).forEach(([frak, normal]) => {
          newLine = newLine.replaceAll(frak, normal);
        });
        if (newLine !== line) {
          lines[i] = newLine;
        }
      }
    }
    
    const newContent = lines.join('\n');
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  });
  
  return totalFixed;
}

console.log('🧹 Cleaning template strings from Fraktur...\n');

const mainCount = processDirectory(path.join(__dirname, '../src/commands'));
const adminCount = processDirectory(path.join(__dirname, '../src/commands/admin'));
const mlbbCount = processDirectory(path.join(__dirname, '../src/commands/mlbb'));

console.log(`\n✅ Total fixed: ${mainCount + adminCount + mlbbCount} files`);
