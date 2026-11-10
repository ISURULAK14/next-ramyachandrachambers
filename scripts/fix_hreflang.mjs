import fs from 'fs';

const files = [
  'D:/ANTIGRAVITY/website/404.html',
  'D:/ANTIGRAVITY/website/company-registration-matara.html',
  'D:/ANTIGRAVITY/website/deed-lawyer-matara.html',
  'D:/ANTIGRAVITY/website/faq.html',
  'D:/ANTIGRAVITY/website/index.html',
  'D:/ANTIGRAVITY/website/notary-public-matara.html'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /<!--\s*Dual-Language & Global 35-Country Multi-Regional Hreflang Mapping\s*-->[\s\S]*?<link rel="alternate" hreflang="x-default" href="([^"]+)">/;
  if (regex.test(content)) {
    content = content.replace(regex, (match, url) => {
      return `<!-- Multi-Regional & Language Canonical Annotations -->\n    <link rel="alternate" hreflang="en" href="${url}">\n    <link rel="alternate" hreflang="x-default" href="${url}">`;
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated hreflang in: ${file}`);
  } else {
    console.log(`Regex did not match for: ${file}`);
  }
}
