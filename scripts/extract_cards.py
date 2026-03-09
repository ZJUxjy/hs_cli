#!/usr/bin/env python3
"""
Extract specific card sets from CardDefs.xml
"""
import re
import sys

# Card ID prefixes to extract
PREFIXES = [
    # Classic
    'CS2_', 'EX1_', 'NEW1_', 'PRO_', 'GAME_',
    # Basic Heroes
    'HERO_0',
    # Blackrock Mountain
    'BRM_',
    # One Night in Karazhan
    'KAR_',
    # The Witchwood
    'GIL_',
]

def extract_cards(input_file, output_file):
    print(f"Reading {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract header
    header_match = re.match(r'(<\?xml[^>]+\?>\s*<CardDefs[^>]*>)', content)
    header = header_match.group(1) if header_match else '<?xml version="1.0" encoding="utf-8"?>\n<CardDefs>'
    
    # Find all Entity elements
    pattern = r'<Entity[^>]*CardID="([^"]+)"[^>]*>.*?</Entity>'
    
    matches = []
    for match in re.finditer(pattern, content, re.DOTALL):
        card_id = match.group(1)
        for prefix in PREFIXES:
            if card_id.startswith(prefix):
                matches.append(match.group(0))
                break
    
    print(f"Found {len(matches)} matching cards")
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write('\n')
        for m in matches:
            f.write('\t')
            f.write(m)
            f.write('\n')
        f.write('</CardDefs>\n')
    
    print(f"Written to {output_file}")

if __name__ == '__main__':
    input_file = '/home/xu/code/hstone/hearthstone/js_fireplace/src/cards/CardDefs.xml'
    output_file = '/home/xu/code/hstone/hearthstone/js_fireplace/src/cards/SelectedCards.xml'
    extract_cards(input_file, output_file)
