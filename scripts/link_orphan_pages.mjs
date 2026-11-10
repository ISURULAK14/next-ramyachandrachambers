import fs from 'fs';

const footerNavServices = `            <nav class="footer-nav" aria-label="Footer Legal Navigation">
                <div class="footer-nav-services" style="display:flex; flex-wrap:wrap; justify-content:center; gap:1.25rem; margin-bottom:0.75rem; font-size:0.85rem;">
                    <a href="deed-lawyer-matara.html" class="footer-link">Deed &amp; Title Conveyancing</a>
                    <a href="notary-public-matara.html" class="footer-link">Notary Public Attestations</a>
                    <a href="company-registration-matara.html" class="footer-link">Company Registration</a>
                    <a href="faq.html" class="footer-link">Chambers Legal FAQ</a>
                </div>
                <div class="footer-nav-row">`;

const files = [
  'D:/ANTIGRAVITY/website/index.html',
  'D:/ANTIGRAVITY/website/faq.html',
  'D:/ANTIGRAVITY/website/deed-lawyer-matara.html',
  'D:/ANTIGRAVITY/website/notary-public-matara.html',
  'D:/ANTIGRAVITY/website/company-registration-matara.html'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const targetPattern = /<nav class="footer-nav" aria-label="Footer Legal Navigation">\s*<div class="footer-nav-row">/;
  if (targetPattern.test(content) && !content.includes('footer-nav-services')) {
    content = content.replace(targetPattern, footerNavServices);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated footer navigation in ${file}`);
  }
}

// Add contextual in-body links in index.html services
let indexContent = fs.readFileSync('D:/ANTIGRAVITY/website/index.html', 'utf8');
if (!indexContent.includes('deed-lawyer-matara.html')) {
  indexContent = indexContent.replace(
    '<li>Partition &amp; co-ownership disputes</li>\r\n                            </ul>',
    '<li>Partition &amp; co-ownership disputes</li>\r\n                            </ul>\r\n                            <p style="margin-top:0.75rem;"><a href="deed-lawyer-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Deed &amp; Title Conveyancing in Matara &rarr;</a></p>'
  );
  if (!indexContent.includes('deed-lawyer-matara.html')) {
    indexContent = indexContent.replace(
      '<li>Partition &amp; co-ownership disputes</li>\n                            </ul>',
      '<li>Partition &amp; co-ownership disputes</li>\n                            </ul>\n                            <p style="margin-top:0.75rem;"><a href="deed-lawyer-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Deed &amp; Title Conveyancing in Matara &rarr;</a></p>'
    );
  }
}

if (!indexContent.includes('company-registration-matara.html')) {
  indexContent = indexContent.replace(
    '<li>Shareholder &amp; director agreements</li>\r\n                            </ul>',
    '<li>Shareholder &amp; director agreements</li>\r\n                            </ul>\r\n                            <p style="margin-top:0.75rem;"><a href="company-registration-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Company Registration &amp; Secretarial in Matara &rarr;</a></p>'
  );
  if (!indexContent.includes('company-registration-matara.html')) {
    indexContent = indexContent.replace(
      '<li>Shareholder &amp; director agreements</li>\n                            </ul>',
      '<li>Shareholder &amp; director agreements</li>\n                            </ul>\n                            <p style="margin-top:0.75rem;"><a href="company-registration-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Company Registration &amp; Secretarial in Matara &rarr;</a></p>'
    );
  }
}

if (!indexContent.includes('notary-public-matara.html')) {
  indexContent = indexContent.replace(
    '<li>Survey on due diligence</li> \r\n                            </ul>',
    '<li>Survey on due diligence</li> \r\n                            </ul>\r\n                            <p style="margin-top:0.75rem;"><a href="notary-public-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Notary Public Attestations in Matara &rarr;</a></p>'
  );
  if (!indexContent.includes('notary-public-matara.html')) {
    indexContent = indexContent.replace(
      '<li>Survey on due diligence</li> \n                            </ul>',
      '<li>Survey on due diligence</li> \n                            </ul>\n                            <p style="margin-top:0.75rem;"><a href="notary-public-matara.html" style="color:var(--gold-accent); text-decoration:underline;">View Notary Public Attestations in Matara &rarr;</a></p>'
    );
  }
}

fs.writeFileSync('D:/ANTIGRAVITY/website/index.html', indexContent, 'utf8');
console.log('Updated index.html in-body contextual links');
