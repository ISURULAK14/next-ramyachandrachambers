import fs from 'fs';

function cleanTransitions(css) {
  return css.replace(/transition:\s*([^;\}]+)/gi, (match, val) => {
    // If it has !important, keep it
    const isImportant = val.includes('!important');
    const cleanVal = val.replace(/!important/g, '').trim();

    // Split multiple transitions
    const parts = cleanVal.split(',').map(p => p.trim());
    const validParts = [];

    for (const part of parts) {
      if (part.startsWith('transform') || part.startsWith('opacity')) {
        validParts.push(part);
      } else {
        // Convert non-composited property to opacity or transform if not already present
        const timing = part.replace(/^[a-zA-Z-]+/, '').trim() || '0.3s ease';
        if (!validParts.some(p => p.startsWith('opacity'))) {
          validParts.push(`opacity ${timing}`);
        }
      }
    }

    const uniqueParts = [...new Set(validParts)];
    const result = uniqueParts.length > 0 ? uniqueParts.join(', ') : 'transform 0.3s ease, opacity 0.3s ease';
    return `transition: ${result}${isImportant ? ' !important' : ''}`;
  });
}

const cssFiles = [
  'D:/ANTIGRAVITY/website/css/style.css',
  'D:/ANTIGRAVITY/website/css/style.min.css'
];

for (const file of cssFiles) {
  let content = fs.readFileSync(file, 'utf8');
  content = cleanTransitions(content);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned transitions in ${file}`);
}

// Also in index.html inline CSS
let indexHtml = fs.readFileSync('D:/ANTIGRAVITY/website/index.html', 'utf8');
indexHtml = indexHtml.replace(/transition:\s*transform 0\.2s,\s*background 0\.2s;/g, 'transition: transform 0.2s, opacity 0.2s;');
fs.writeFileSync('D:/ANTIGRAVITY/website/index.html', indexHtml, 'utf8');
console.log('Cleaned transitions in index.html');
