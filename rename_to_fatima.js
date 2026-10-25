// rename_to_fatima.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);

const REPLACEMENTS = [
  [ /Fatima Rashid/g, 'Fatima Rashid' ],
  [ /FATIMA RASHID/g, 'FATIMA RASHID' ],
  [ /Fatima_Rashid/g, 'Fatima_Rashid' ],
  [ /fatimarashid\.design/g, 'fatimarashid.design' ],
  [ /fatimarashid-design/g, 'fatimarashid-design' ],
  [ /fatimarashid_design/g, 'fatimarashid_design' ],
  [ /fatimarashidPic\.webp/g, 'fatimarashidPic.webp' ],
  [ /fatimarashid/g, 'fatimarashid' ],
  [ /fatimarashid/g, 'fatimarashid' ],
  [ /\bUsama\b/g, 'Fatima' ],
  [ /\busama\b/g, 'fatima' ],
  [ /\bZahid\b/g, 'Rashid' ],
  [ /\bzahid\b/g, 'rashid' ],
];

function applyReplacements(content) {
  let updated = content;
  for (const [pattern, replacement] of REPLACEMENTS) {
    updated = updated.replace(pattern, replacement);
  }
  return updated;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.js', '.json', '.bat', '.xml'].includes(ext)) {
        try {
          const original = fs.readFileSync(fullPath, 'utf8');
          const updated = applyReplacements(original);
          if (updated !== original) {
            fs.writeFileSync(fullPath, updated, 'utf8');
            console.log(`Updated: ${path.relative(ROOT, fullPath)}`);
          }
        } catch (err) {
          console.warn(`Could not process ${fullPath}: ${err.message}`);
        }
      }
    }
  }
}

console.log('Renaming all occurrences of Fatima Rashid -> Fatima Rashid...');
processDirectory(ROOT);
console.log('Finished renaming successfully!');
