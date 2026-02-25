import json

def list_root_keys(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        # We need to find duplicates at the root level BEFORE json.load overwrites them
        content = f.read()
        lines = content.split('\n')
        root_keys = []
        for line in lines:
            if line.startswith('  "'):
                key = line.split('"')[1]
                root_keys.append(key)
        
        counts = {}
        for k in root_keys:
            counts[k] = counts.get(k, 0) + 1
        
        for k, c in counts.items():
            if c > 1:
                print(f"ROOT KEY DUPLICATE: {k} appears {c} times")

list_root_keys(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
