#!/usr/bin/env python3
"""
Properly add reply function to all command files
"""

import os
import re
from pathlib import Path

COMMANDS_DIR = Path(__file__).parent / "src" / "commands"

def has_reply_param(content):
    """Check if execute function already has reply parameter"""
    return re.search(r'execute\([^)]*,\s*reply\s*\)', content) is not None

def add_reply_to_execute(content):
    """Add reply parameter to execute function"""
    # Pattern: async execute(sock, message, args, user, isGroup, groupData)
    # Change to: async execute(sock, message, args, user, isGroup, groupData, reply)
    content = re.sub(
        r'(async execute\([^)]*groupData)(\s*\))',
        r'\1, reply\2',
        content
    )
    return content

def get_senderJid_line(content):
    """Check if senderJid is already defined"""
    if 'const senderJid = message.key.remoteJid' in content:
        return None  # Already defined
    return 'const senderJid = message.key.remoteJid;'

def fix_sendmessage_calls(content):
    """Fix all sock.sendMessage calls to use reply with fallback"""
    
    # First, ensure senderJid is defined if needed
    lines = content.split('\n')
    has_senderJid = any('const senderJid = message.key.remoteJid' in line for line in lines)
    
    if not has_senderJid and 'sock.sendMessage(senderJid' in content:
        # Find the execute function and add senderJid after opening brace
        content = re.sub(
            r'(async execute\([^{]*\{)',
            lambda m: m.group(1) + '\n    const senderJid = message.key.remoteJid;',
            content
        )
    
    # Replace simple text responses: sock.sendMessage(senderJid, { text: ... })
    # With reply fallback
    pattern = r'await sock\.sendMessage\(senderJid,\s*\{\s*text:\s*([^}]*?)\s*\}\s*\);'
    
    def replace_simple_message(match):
        text_arg = match.group(1)
        return f"""if (reply) {{
        await reply({{ text: {text_arg} }});
      }} else {{
        await sock.sendMessage(senderJid, {{ text: {text_arg} }});
      }}"""
    
    content = re.sub(pattern, replace_simple_message, content, flags=re.MULTILINE | re.DOTALL)
    
    # Replace image/media responses: sock.sendMessage(senderJid, createMessageWithImage(...))
    pattern2 = r'await sock\.sendMessage\(senderJid,\s*MessageFormatter\.createMessageWithImage\(([^)]*)\)\s*\);'
    
    def replace_image_message(match):
        arg = match.group(1)
        return f"""if (reply) {{
        await reply(MessageFormatter.createMessageWithImage({arg}));
      }} else {{
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage({arg}));
      }}"""
    
    content = re.sub(pattern2, replace_image_message, content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def fix_command_file(filepath):
    """Fix a single command file"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already fixed
    if has_reply_param(content):
        print(f"  ✅ {filepath.name} - already has reply")
        return False
    
    # Add reply parameter
    content = add_reply_to_execute(content)
    
    # Fix all sock.sendMessage calls
    content = fix_sendmessage_calls(content)
    
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
