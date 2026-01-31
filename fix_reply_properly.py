#!/usr/bin/env python3
"""
Fix reply function in all command files properly
"""

import os
import re
from pathlib import Path

COMMANDS_DIR = Path(__file__).parent / "src" / "commands"

def fix_command_file(filepath):
    """Fix a single command file with proper reply handling"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has proper reply handling
    if "if (reply)" in content and "await reply(" in content:
        print(f"  ✅ {filepath.name} - already updated")
        return False
    
    # If it still has the malformed format from the broken script, fix it
    content = re.sub(
        r'if \(reply\)\s*\{\s*\n\s*await reply\(\{?\s*text:\s*',
        'if (reply) {\n        await reply({ text: ',
        content,
        flags=re.MULTILINE
    )
    
    # Fix the closing of reply blocks (multiple patterns)
    # Pattern 1: } else { with malformed sock.sendMessage
    content = re.sub(
        r'(\} else \{\s*\n\s*await sock\.sendMessage\(senderJid, \{\s*text:\s*)',
        r'} else {\n        await sock.sendMessage(senderJid, { text: ',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 2: Fix double closing braces and quotes
    content = re.sub(
        r'(\.warning|\.error)\([\'"]([^\'"]*)[\'"\)]*[;]*\s*\}\s*\}\s*\}\)\s*\)',
        r'\1(\'\2\')',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 3: Fix malformed createMessageWithImage calls
    content = re.sub(
        r'await (reply|sock\.sendMessage\([^)]*)\(MessageFormatter\.createMessageWithImage\(([^)]*)\)[;]*\s*\}',
        r'await \1(MessageFormatter.createMessageWithImage(\2));',
        content,
        flags=re.MULTILINE
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ {filepath.name}")
    return True

# Get all command files
command_files = sorted(COMMANDS_DIR.glob("*.js"))

print("=" * 60)
print(f"🔧 Fixing {len(command_files)} command files")
print("=" * 60)

fixed_count = 0
for cmd_file in command_files:
    if fix_command_file(cmd_file):
        fixed_count += 1

print("=" * 60)
print(f"✅ {fixed_count} fichiers corrigés")
print("=" * 60)
