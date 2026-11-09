const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) search(full);
    else if (f.name.endsWith('.js')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('weeks per build') || c.includes('Read full story & method') || c.includes('Read full story')) {
        console.log('Match in chunk:', path.relative(__dirname, full));
      }
    }
  }
}
search(path.join(__dirname, 'nxt', 'static', 'chunks'));
