const fs = require('fs');
const path = require('path');

// Fraktur to normal character mapping (reverse)
const frakturToNormal = {
  '𝔄': 'A', '𝔅': 'B', '𝔆': 'C', '𝔇': 'D', '𝔈': 'E', '𝔉': 'F', '𝔊': 'G',
  '𝔋': 'H', '𝔌': 'I', '𝔍': 'J', '𝔎': 'K', '𝔏': 'L', '𝔐': 'M', '𝔑': 'N',
  '𝔒': 'O', '𝔓': 'P', '𝔔': 'Q', '𝔕': 'R', '𝔖': 'S', '𝔗': 'T', '𝔘': 'U',
  '𝔙': 'V', '𝔚': 'W', '𝔛': 'X', '𝔜': 'Y', '𝔝': 'Z',
  '𝔞': 'a', '𝔟': 'b', '𝔠': 'c', '𝔡': 'd', '𝔢': 'e', '𝔣': 'f', '𝔤': 'g',
  '𝔥': 'h', '𝔦': 'i', '𝔧': 'j', '𝔨': 'k', '𝔩': 'l', '𝔪': 'm', '𝔫': 'n',
  '𝔬': 'o', '𝔭': 'p', '𝔮': 'q', '𝔯': 'r', '𝔰': 's', '𝔱': 't', '𝔲': 'u',
  '𝔳': 'v', '𝔴': 'w', '𝔵': 'x', '𝔶': 'y', '𝔷': 'z',
  '𝟘': '0', '𝟙': '1', '𝟚': '2', '𝟛': '3', '𝟜': '4', '𝟝': '5', '𝟞': '6',
  '𝟟': '7', '𝟠': '8', '𝟡': '9'
};

// Files with template string issues
const filesToFix = {
  'src/commands/admin/tournoisquiz.js': [
    { line: 245, broken: '${𝔰𝔢𝔱𝔯𝔞.𝔮𝔲𝔦𝔷𝔇𝔞𝔱𝔞.𝔱𝔬𝔙𝔭𝔭𝔠𝔯𝔠𝔞𝔰𝔠()}', correct: '${setup.quizName.toUpperCase()}' },
    { line: 110, pattern: '𝔆𝔒𝔑𝔉𝔦𝔊𝔘𝔯𝔞𝔱𝔦𝔒𝔫', correct: 'CONFIGURATION' },
    { line: 331, pattern: '𝔔𝔲𝔊𝔰𝔱𝔦𝔒𝔫', correct: 'QUESTION' },
    { line: 408, pattern: '𝔴𝔤𝔞𝔯𝔞𝔳𝔞𝔞', correct: 'RESULTATS' }
  ],
  'src/commands/menu.js': [
    { pattern: '𝔈𝔪𝔢𝔯𝔦 - 𝔬𝔞𝔬𝔫${', shouldBe: 'MENU - Pack: ${' }
  ]
};

const baseDir = path.join(__dirname, '..');

for (const [filePath, fixes] of Object.entries(filesToFix)) {
  const fullPath = path.join(baseDir, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Fix template string issues
    fixes.forEach(fix => {
      if (fix.broken && fix.correct) {
        if (content.includes(fix.broken)) {
          content = content.replace(fix.broken, fix.correct);
          console.log(`✅ Fixed ${filePath}: template string restored`);
          modified = true;
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

console.log('\n✅ All template strings cleaned!');
