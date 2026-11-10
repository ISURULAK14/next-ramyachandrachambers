#!/usr/bin/env python3
"""
Automated IndexNow Submitter for https://ramyachandrachambers.com/
Notifies search engines (Bing, Yandex, Seznam, Naver) immediately when content changes.
"""
import urllib.request
import json
import ssl

HOST = "ramyachandrachambers.com"
KEYS = [
    "4a8f9c2d1e7b304586f0a12e34d56789",
    "8796e635b2be4fbb80453e5cd791ed92"
]

URL_LIST = [
    "https://ramyachandrachambers.com/",
    "https://ramyachandrachambers.com/about.html",
    "https://ramyachandrachambers.com/services.html",
    "https://ramyachandrachambers.com/practice-areas.html",
    "https://ramyachandrachambers.com/testimonials.html",
    "https://ramyachandrachambers.com/contact.html",
    "https://ramyachandrachambers.com/notary-public-matara.html",
    "https://ramyachandrachambers.com/deed-lawyer-matara.html",
    "https://ramyachandrachambers.com/company-registration-matara.html",
    "https://ramyachandrachambers.com/faq.html",
    "https://ramyachandrachambers.com/overseas-power-of-attorney-sri-lanka.html",
    "https://ramyachandrachambers.com/land-registry-title-search-sri-lanka.html",
    "https://ramyachandrachambers.com/company-registration-sri-lanka-beneficial-ownership.html",
    "https://ramyachandrachambers.com/land-partition-law-procedure-sri-lanka.html",
    "https://ramyachandrachambers.com/foreign-investment-property-acquisition-sri-lanka.html",
    "https://ramyachandrachambers.com/last-will-testamentary-probate-sri-lanka.html",
    "https://ramyachandrachambers.com/privacy-policy.html",
    "https://ramyachandrachambers.com/terms-of-engagement.html"
]

ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
    "https://search.seznam.cz/indexnow"
]

def submit():
    ctx = ssl.create_default_context()
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "IndexNowSubmitter/1.0 (ramyachandrachambers.com)"
    }

    for key in KEYS:
        key_location = f"https://{HOST}/{key}.txt"
        payload = {
            "host": HOST,
            "key": key,
            "keyLocation": key_location,
            "urlList": URL_LIST
        }
        data = json.dumps(payload).encode('utf-8')

        print(f"\n--- Submitting with Key: {key} ---")
        for endpoint in ENDPOINTS:
            print(f"Submitting {len(URL_LIST)} URLs to {endpoint}...")
            try:
                req = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")
                with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                    status = response.getcode()
                    print(f"  Status: {status} OK")
            except urllib.error.HTTPError as e:
                print(f"  HTTPError: {e.code} - {e.reason}")
                try:
                    print(f"  Response: {e.read().decode('utf-8')}")
                except Exception:
                    pass
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    submit()
