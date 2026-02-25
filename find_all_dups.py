import collections
import re

def find_duplicate_keys_anywhere(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match strings like "key":
    key_pattern = re.compile(r'"([^"]+)":')
    keys_found = collections.defaultdict(list)
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        matches = key_pattern.findall(line)
        for m in matches:
            keys_found[m].append(i + 1)
            
    for key, line_numbers in keys_found.items():
        if len(line_numbers) > 1:
            print(f"Key '{key}' found at lines: {line_numbers}")

print("Checking en.json...")
find_duplicate_keys_anywhere(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
