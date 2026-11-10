with open(r"C:\Users\isuru\.gemini\antigravity\brain\459b87bc-748a-4c34-946a-7ad04014b816\scratch\build_unified_site.py", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for i in range(1415, min(len(lines), 1490)):
    print(f"{i+1}: {lines[i].rstrip()}")
