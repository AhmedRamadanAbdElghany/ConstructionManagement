import collections

def find_root_duplicates_pedantic(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    root_keys = collections.defaultdict(list)
    for i, line in enumerate(lines):
        if line.startswith('  "'):
            key = line.split('"')[1]
            root_keys[key].append(i + 1)
            
    for key, lines_found in root_keys.items():
        if len(lines_found) > 1:
            print(f"ROOT KEY '{key}' found at lines: {lines_found}")

print("Checking en.json...")
find_root_duplicates_pedantic(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
