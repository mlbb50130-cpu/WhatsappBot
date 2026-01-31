import os
import re

commands_dir = 'src/commands'

# Pattern à remplacer
# De: await sock.sendMessage(senderJid, { text: ... })
# À: await reply({ text: ... })
# ou
# À: if (reply) await reply(...); else await sock.sendMessage(...)

count = 0
files_modified = []

for filename in os.listdir(commands_dir):
    if not filename.endswith('.js'):
        continue
    
    filepath = os.path.join(commands_dir, filename)
    
    if os.path.isdir(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Vérifier si la commande a déjà le paramètre reply
    if 'async execute(sock, message, args, user, isGroup, groupData, reply)' not in content:
        # Ajouter le paramètre reply à la signature execute
        content = re.sub(
            r'async execute\(sock, message, args, user, isGroup, groupData\)',
            'async execute(sock, message, args, user, isGroup, groupData, reply)',
            content
        )
    
    # Remplacer sock.sendMessage par une fonction qui utilise reply
    # Pattern: await sock.sendMessage(senderJid, ...)
    # Remplacer par: if (reply) await reply(...); else await sock.sendMessage(...)
    
    # Mais d'abord, extraire le senderJid s'il existe
    if 'const senderJid = message.key.remoteJid' not in content:
        # Ajouter au début de la fonction execute
        content = re.sub(
            r'(async execute\([^)]+\) \{\s*)',
            r'\1const senderJid = message.key.remoteJid;\n    ',
            content
        )
    
    # Remplacer les appels sock.sendMessage
    def replace_send_message(match):
        full_match = match.group(0)
        # Extraire le contenu entre les accolades
        if 'senderJid' in full_match:
            # C'est déjà en utilisant senderJid, juste remplacer par reply
            content_part = full_match.replace('await sock.sendMessage(senderJid, ', '').rstrip(')')
            return f'if (reply) {{\n      await reply({content_part});\n    }} else {{\n      await sock.sendMessage(senderJid, {content_part});\n    }}'
        return full_match
    
    # Simple pattern pour remplacer
    new_content = re.sub(
        r'await sock\.sendMessage\(senderJid, ([^)]+)\)',
        lambda m: f'if (reply) {{\n      await reply({m.group(1)});\n    }} else {{\n      await sock.sendMessage(senderJid, {m.group(1)});\n    }}',
        content
    )
    
    if new_content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_modified.append(filename)
        count += 1

print("=" * 60)
print(f"✅ {count} fichiers modifiés")
print("=" * 60)
for f in files_modified[:10]:
    print(f"  ✅ {f}")
if len(files_modified) > 10:
    print(f"  ... et {len(files_modified) - 10} autres")
print("=" * 60)
