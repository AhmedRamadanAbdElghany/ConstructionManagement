import json

def find_duplicates(file_path):
    found_any = False
    def check_duplicates(pairs):
        nonlocal found_any
        keys = []
        for k, v in pairs:
            if k in keys:
                print(f"DUPLICATE KEY FOUND in object: {k}")
                found_any = True
            keys.append(k)
        return dict(pairs)

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            json.load(f, object_pairs_hook=check_duplicates)
            if not found_any:
                print("No duplicates found in " + file_path)
        except Exception as e:
            print(f"Error parsing JSON in {file_path}: {e}")

print("Checking en.json...")
find_duplicates(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
print("\nChecking ar.json...")
find_duplicates(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\ar.json')
