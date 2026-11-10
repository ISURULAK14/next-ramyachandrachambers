import json
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Build comprehensive 100% SEO, GEO, AEO Schema Graph
enhanced_schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LegalService", "Attorney"],
      "@id": "https://ramyachandrachambers.com/#organization",
      "name": "Ramyachandra Gunasekera Chambers",
      "alternateName": ["RG Chambers", "Ramyachandra Gunasekera Law Firm", "Attorney Ramyachandra Chambers"],
      "url": "https://ramyachandrachambers.com/",
      "logo": "https://ramyachandrachambers.com/searchlogo.svg",
      "image": "https://ramyachandrachambers.com/photo.gif",
      "description": "Premier legal counsel, deed drafting, title conveyancing, notary public attestations, private limited company registration, and court litigation in Matara and across Sri Lanka.",
      "telephone": "+94412239429",
      "email": "ramyachandra@sltnet.lk",
      "foundingDate": "1988",
      "priceRange": "$$",
      "knowsLanguage": ["en", "si", "ta"],
      "knowsAbout": [
        "Civil Litigation", "Criminal Defense", "Partition Law Sri Lanka", "Property Title Examination",
        "Notarial Conveyancing", "Deed Drafting", "Company Registration Sri Lanka", "Registered Company Secretary",
        "Beneficial Ownership BO Compliance", "Inland Revenue TIN Registration", "Power of Attorney for Non-Residents",
        "Consular Legalization", "BOI Company Incorporation", "Foreign Direct Investment Real Estate",
        "Probate & Testamentary Law", "Divorce & Family Law", "Labour Law Sri Lanka"
      ],
      "areaServed": [
        {"@type": "Country", "name": "Sri Lanka"},
        {"@type": "Country", "name": "United States"},
        {"@type": "Country", "name": "United Kingdom"},
        {"@type": "Country", "name": "Australia"},
        {"@type": "Country", "name": "New Zealand"},
        {"@type": "Country", "name": "Germany"},
        {"@type": "Country", "name": "France"},
        {"@type": "Country", "name": "Italy"},
        {"@type": "Country", "name": "Switzerland"},
        {"@type": "Country", "name": "Netherlands"},
        {"@type": "Country", "name": "Japan"},
        {"@type": "Country", "name": "South Korea"},
        {"@type": "Country", "name": "China"},
        {"@type": "Country", "name": "Singapore"},
        {"@type": "Country", "name": "Malaysia"},
        {"@type": "Country", "name": "United Arab Emirates"},
        {"@type": "Country", "name": "India"},
        {"@type": "Country", "name": "Maldives"},
        {"@type": "Country", "name": "Canada"}
      ],
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".hero-title", ".hero-subtitle", ".about-text", ".faq-question", ".faq-answer-text"]
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Chamber Legal Services",
        "itemListElement": [
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Property Deed Drafting & Conveyancing"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Notary Public Attestations & Title Searches"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Private Limited Company Registration & Secretarial"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "District & Magistrate Court Litigation Advocacy"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Non-Resident Power of Attorney & Consular Legalization"}}
        ]
      }
    },
    {
      "@type": "LegalService",
      "@id": "https://ramyachandrachambers.com/#head-office",
      "name": "Ramyachandra Gunasekera Chambers — Matara Fort (Head Office)",
      "parentOrganization": { "@id": "https://ramyachandrachambers.com/#organization" },
      "url": "https://ramyachandrachambers.com/",
      "telephone": "+94412239429",
      "priceRange": "$$",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "17:00"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 33, Sri Dharmarama Mawatha, Fort (Court Road)",
        "addressLocality": "Matara",
        "postalCode": "81000",
        "addressRegion": "Southern Province",
        "addressCountry": "LK"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 5.9449,
        "longitude": 80.5438
      },
      "hasMap": "https://www.google.com/maps/search/?api=1&query=WGVW%2BJ3%20Matara%2C%20Sri%20Lanka",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "37"
      }
    },
    {
      "@type": "LegalService",
      "@id": "https://ramyachandrachambers.com/#kamburugamuwa-office",
      "name": "Ramyachandra Gunasekera Chambers — Kamburugamuwa / Mirissa (Branch Office)",
      "parentOrganization": { "@id": "https://ramyachandrachambers.com/#organization" },
      "url": "https://ramyachandrachambers.com/",
      "telephone": "+94412239429",
      "priceRange": "$$",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "17:00"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Labima Road",
        "addressLocality": "Kamburugamuwa",
        "postalCode": "81750",
        "addressRegion": "Southern Province",
        "addressCountry": "LK"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 5.9405,
        "longitude": 80.4856
      },
      "hasMap": "https://www.google.com/maps/search/?api=1&query=XF8W%2BRPQ%20Kamburugamuwa%2C%20Sri%20Lanka",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "12"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://ramyachandrachambers.com/#website",
      "url": "https://ramyachandrachambers.com/",
      "name": "Ramyachandra Gunasekera Chambers",
      "description": "Premier legal counsel, court litigation, notarial conveyancing, and company secretarial practice in Sri Lanka.",
      "publisher": { "@id": "https://ramyachandrachambers.com/#organization" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ramyachandrachambers.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://ramyachandrachambers.com/"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://ramyachandrachambers.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can I register a property deed in Matara and Southern Sri Lanka?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A comprehensive 30-year title search is conducted at the Matara Land Registry to verify ownership and detect encumbrances. Following execution before a licensed Notary Public and two attesting witnesses, the original deed and registry applications are formally submitted for registration."
          }
        },
        {
          "@type": "Question",
          "name": "How is a private limited company registered in Sri Lanka?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Company registration is processed through the Department of Registrar of Companies (DRC) e-ROC portal: name approval, Form 1 (incorporation), Form 18 (director consent), Form 19 (company secretary consent), Articles of Association, Beneficial Ownership (BO) disclosure, and Inland Revenue TIN assignment."
          }
        },
        {
          "@type": "Question",
          "name": "Can non-residents and overseas diaspora execute a Power of Attorney for Sri Lankan property?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Non-resident clients can execute a Special or General Power of Attorney before a Sri Lankan Diplomatic Mission, Embassy, High Commission, or local notary abroad with consular legalization and stamping at the Registrar General's Department in Sri Lanka."
          }
        }
      ]
    }
  ]
}

# Replace existing JSON-LD in index.html cleanly
json_str = json.dumps(enhanced_schema, indent=2)
repl_block = f'<script type="application/ld+json">\n{json_str}\n    </script>'
html = re.sub(
    r'<script type="application/ld\+json">[\s\S]*?</script>',
    lambda m: repl_block,
    html,
    count=1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: index.html upgraded with comprehensive SEO, GEO, and AEO Schema.org Graph!")
