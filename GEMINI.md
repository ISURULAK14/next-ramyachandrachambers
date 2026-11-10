# Project Guidelines: Ramyachandra Chambers Website

## Permanent Core Mandate
1. **Canonical Baseline**: The canonical stable baseline is the pre-October build preserved on the `pre_october` branch (based on commit `f7a11df`). Never overwrite or discard this layout and aesthetic.
2. **CSS Link Integrity**: Always load the full stylesheet via direct `<link rel="stylesheet" href="css/style.min.css?v=...">`. Never use regex replacements that can corrupt version strings into `css/$19...`. Never use fragile preload-onload hacks that fail silently.
3. **HTML Syntax Integrity**: Ensure `<head>` tags have no trailing angle brackets (e.g. `counsel.">>`) or bare text that forces premature `<head>` closure in the browser parser.
4. **Zero-Omission Component Verification**: Before pushing any change to `main`, verify all components render with non-zero dimensions and proper spacing across desktop and mobile:
   - Navigation (`#main-nav`)
   - Stepped Hero Title & Counter (`#home`)
   - About Section & Portrait (`#about`)
   - Core Services Accordion Cards (`#services`)
   - Practice Areas (`#practice-areas`)
   - Testimonials & World Map (`#testimonials`)
   - Contact Offices & Maps (`#contact`)
   - Footer (`.site-footer`)
