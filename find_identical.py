import collections

def find_identical_lines(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    line_counts = collections.defaultdict(list)
    for i, line in enumerate(lines):
        clean_line = line.strip()
        if clean_line and clean_line not in ['{', '}', '},', '],', ']']:
            line_counts[clean_line].append(i + 1)
            
    for content, lines_found in line_counts.items():
        if len(lines_found) > 1:
            # Maybe check if they are keys?
            if content.startswith('"') and content.endswith(','):
                 print(f"IDENTICAL LINE '{content}' found at lines: {lines_found}")

print("Checking en.json...")
find_identical_lines(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
