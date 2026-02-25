import json

def find_path_duplicates(file_path):
    def check_duplicates(pairs):
        keys = []
        for k, v in pairs:
            if k in keys:
                print(f"DUPLICATE KEY FOUND at path: {k}")
            keys.append(k)
        return dict(pairs)

    with open(file_path, 'r', encoding='utf-8') as f:
        json.load(f, object_pairs_hook=check_duplicates)

print("Checking en.json...")
find_path_duplicates(r'c:\Users\Ahmed.Ramadan\source\repos\Construction\construction-cms\src\assets\i18n\en.json')
