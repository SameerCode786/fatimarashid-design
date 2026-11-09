const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [...html.matchAll(/50/g)];
console.log('Total 50 in index.html:', matches.length);
matches.forEach((m, i) => {
  console.log(`[${i}]`, html.slice(Math.max(0, m.index - 40), m.index + 50));
});
