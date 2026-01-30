import re
import os

# Lire la documentation
with open('src/commands/documentation.js', 'r', encoding='utf-8') as f:
    doc_content = f.read()

# Extraire toutes les commandes documentées (pattern: **!command** ou **!command @user**)
commands_in_doc = set()
pattern = r'\*\*!(\w+)'
matches = re.findall(pattern, doc_content)
commands_in_doc.update(matches)

# Lire les fichiers réels
commands_dir = 'src/commands'
files = set()
for file in os.listdir(commands_dir):
    if file.endswith('.js') and not os.path.isdir(os.path.join(commands_dir, file)):
        files.add(file.replace('.js', ''))

# Comparer
missing = sorted(commands_in_doc - files)

print("=" * 60)
print("COMMANDES DOCUMENTÉES MAIS NON IMPLÉMENTÉES:")
print("=" * 60)

if missing:
    for cmd in missing:
        print(f"  ❌ !{cmd}")
    print(f"\nTotal: {len(missing)} commande(s) manquante(s)")
else:
    print("✅ Aucune commande manquante!")

print("\n" + "=" * 60)
print(f"Commandes documentées: {len(commands_in_doc)}")
print(f"Commandes implémentées: {len(files)}")
print("=" * 60)
