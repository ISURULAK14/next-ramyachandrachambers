import json
import re

log_path = r"C:\Users\isuru\.gemini\antigravity\brain\459b87bc-748a-4c34-946a-7ad04014b816\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if '500' in line or 'cohort' in line or 'sequence' in line:
            obj = json.loads(line)
            content = obj.get('content', '')
            if 'cohort' in content or '500ms' in content or 'pin-' in content:
                print("--- MATCH ---")
                print(content[:500])
