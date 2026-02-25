import re

def find_root_duplicates(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Root keys are like "key": { or "key": "value" at level 1 (2 spaces)
    root_key_pattern = re.compile(r'^  "([^"]+)":', re.MULTILINE)
    matches = root_key_pattern.finditer(content)
    
    root_keys = {}
    for match in matches:
        key = match.group(1)
        line_num = content[:match.start()].count('\n') + 1
        if key in root_keys:
            print(f"ROOT KEY DUPLICATE: '{key}' at lines {root_keys[key]} and {line_num}")
        root_keys[key] = line_num

find_root_duplicates(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
