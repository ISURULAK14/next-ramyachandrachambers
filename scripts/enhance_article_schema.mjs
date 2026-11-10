import fs from 'fs';

const pages = [
  {
    file: 'D:/ANTIGRAVITY/website/company-registration-matara.html',
    headline: 'Company Registration & Secretary Services in Matara',
    desc: 'Professional Company Secretarial services ensuring strict compliance with the Registrar of Companies (eROC) and the Companies Act No. 07 of 2007 in Matara.'
  },
  {
    file: 'D:/ANTIGRAVITY/website/deed-lawyer-matara.html',
    headline: 'Deed & Conveyancing Services in Matara',
    desc: 'Title examination, deed drafting, conveyancing, and Land Registry searches in Matara and the Southern Province.'
  },
  {
    file: 'D:/ANTIGRAVITY/website/notary-public-matara.html',
    headline: 'Notary Public Services in Matara',
    desc: 'Official notarial attestations, deeds of transfer, powers of attorney, affidavits, and statutory declarations in Matara.'
  }
];

for (const p of pages) {
  let content = fs.readFileSync(p.file, 'utf8');
  const targetRegex = /<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"Article"[\s\S]*?\}\s*<\/script>/;
  const newSchema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${p.headline}",
  "description": "${p.desc}",
  "image": "https://ramyachandrachambers.com/photo.gif",
  "datePublished": "2024-01-01",
  "dateModified": "2026-09-01",
  "author": {
    "@type": "Person",
    "name": "Ramyachandra Gunasekera"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Ramyachandra Gunasekera Chambers",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ramyachandrachambers.com/searchlogo.svg"
    }
  }
}
</script>`;

  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, newSchema);
    fs.writeFileSync(p.file, content, 'utf8');
    console.log(`Enhanced Article schema in ${p.file}`);
  }
}
