#!/usr/bin/env ts
/**
 * Better translation script that properly converts Python fireplace card scripts to TypeScript
 */

import * as fs from 'fs';
import * as path from 'path';

const FIREPLACE_PATH = '/home/xu/code/hstone/hearthstone/fireplace/fireplace/cards';
const OUTPUT_PATH = '/home/xu/code/hstone/hearthstone/js_fireplace/src/cards/mechanics';

// Translate Python DSL to TypeScript
function translatePythonToTypeScript(pythonContent: string, setName: string): string {
  const lines = pythonContent.split('\n');
  const tsLines: string[] = [];

  // Header
  tsLines.push(`// ${setName} Card Scripts`);
  tsLines.push(`// Translated from Python fireplace`);
  tsLines.push('');
  tsLines.push(`import { cardScriptsRegistry, ActionContext } from '../../index';`);
  tsLines.push('');
  tsLines.push(`// Import actions`);
  tsLines.push(`import { Damage } from '../../../actions/damage';`);
  tsLines.push(`import { Draw } from '../../../actions/draw';`);
  tsLines.push(`import { Summon } from '../../../actions/summon';`);
  tsLines.push(`import { Buff } from '../../../actions/buff';`);
  tsLines.push(`import { Destroy } from '../../../actions/destroy;`);
  tsLines.push('');

  let currentCard: { id: string; name: string; lines: string[] } | null = null;
  let inClass = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines at start
    if (!trimmed && !inClass) continue;

    // Skip imports
    if (trimmed.startsWith('from ') || trimmed.startsWith('import ')) continue;

    // Skip comments at top
    if (trimmed.startsWith('##')) continue;

    // Class definition
    const classMatch = trimmed.match(/^class\s+(\w+)\s*:\s*"""(.+?)"""/);
    const classMatch2 = trimmed.match(/^class\s+(\w+)\s*:/);

    if (classMatch) {
      // Save previous card
      if (currentCard) {
        finishCard(tsLines, currentCard);
      }

      currentCard = {
        id: classMatch[1],
        name: classMatch[2],
        lines: []
      };
      inClass = true;
      continue;
    } else if (classMatch2) {
      if (currentCard) {
        finishCard(tsLines, currentCard);
      }
      currentCard = {
        id: classMatch2[1],
        name: '',
        lines: []
      };
      inClass = true;
      continue;
    }

    // Inside a class
    if (currentCard) {
      // End of class (empty line or new class)
      if (!trimmed) {
        const nextLine = lines[i + 1]?.trim();
        if (!nextLine || nextLine.startsWith('class ')) {
          finishCard(tsLines, currentCard);
          currentCard = null;
          inClass = false;
        }
        continue;
      }

      // Skip special methods like __init__
      if (trimmed.startsWith('def ')) continue;

      currentCard.lines.push(trimmed);
    }
  }

  // Finish last card
  if (currentCard) {
    finishCard(tsLines, currentCard);
  }

  return tsLines.join('\n');
}

function finishCard(tsLines: string[], card: { id: string; name: string; lines: string[] }) {
  tsLines.push(`// ${card.id}${card.name ? ` - ${card.name}` : ''}`);
  tsLines.push(`cardScriptsRegistry.register('${card.id}', {`);

  const lines = card.lines;

  // Check for requirements
  const reqMatch = lines.find(l => l.startsWith('requirements = {'));
  if (reqMatch) {
    const reqContent = extractBlock(lines, 'requirements');
    if (reqContent) {
      tsLines.push(`  requirements: {`);
      // Parse requirements
      const reqLines = reqContent.split('\n');
      for (const reqLine of reqLines) {
        const match = reqLine.match(/PlayReq\.(\w+):\s*(\d+)/);
        if (match) {
          tsLines.push(`    [PlayReq.${match[1]}]: ${match[2]},`);
        }
      }
      tsLines.push(`  },`);
    }
  }

  // Check for play effect
  const playMatch = lines.find(l => l.startsWith('play ='));
  if (playMatch) {
    const playContent = extractBlock(lines, 'play');
    if (playContent) {
      tsLines.push(`  play: (ctx: ActionContext) => {`);
      tsLines.push(`    // ${playContent.trim()}`);
      tsLines.push(`    // TODO: Implement`);
      tsLines.push(`  },`);
    } else {
      // Simple one-liner
      const effect = playMatch.replace('play =', '').trim();
      tsLines.push(`  play: (ctx: ActionContext) => {`);
      tsLines.push(`    // ${effect}`);
      tsLines.push(`  },`);
    }
  }

  // Check for deathrattle
  const deathrattleMatch = lines.find(l => l.startsWith('deathrattle ='));
  if (deathrattleMatch) {
    const effect = deathrattleMatch.replace('deathrattle =', '').trim();
    tsLines.push(`  deathrattle: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for events
  const eventsMatch = lines.find(l => l.startsWith('events ='));
  if (eventsMatch) {
    const eventsContent = extractBlock(lines, 'events');
    if (eventsContent) {
      tsLines.push(`  events: {`);
      tsLines.push(`    // ${eventsContent.trim()}`);
      tsLines.push(`  },`);
    }
  }

  // Check for inspire
  const inspireMatch = lines.find(l => l.startsWith('inspire ='));
  if (inspireMatch) {
    const effect = inspireMatch.replace('inspire =', '').trim();
    tsLines.push(`  inspire: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for trigger
  const triggerMatch = lines.find(l => l.startsWith('trigger ='));
  if (triggerMatch) {
    const effect = triggerMatch.replace('trigger =', '').trim();
    tsLines.push(`  trigger: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for choose
  const chooseMatch = lines.find(l => l.startsWith('choose ='));
  if (chooseMatch) {
    tsLines.push(`  // choose cards`);
  }

  // Check for activate (hero cards)
  const activateMatch = lines.find(l => l.startsWith('activate ='));
  if (activateMatch) {
    const effect = activateMatch.replace('activate =', '').trim();
    tsLines.push(`  activate: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for combo
  const comboMatch = lines.find(l => l.startsWith('combo ='));
  if (comboMatch) {
    const effect = comboMatch.replace('combo =', '').trim();
    tsLines.push(`  combo: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for overkill
  const overkillMatch = lines.find(l => l.startsWith('overkill ='));
  if (overkillMatch) {
    const effect = overkillMatch.replace('overkill =', '').trim();
    tsLines.push(`  overkill: (ctx: ActionContext) => {`);
    tsLines.push(`    // ${effect}`);
    tsLines.push(`  },`);
  }

  // Check for quest (UNG_xxx)
  const progressMatch = lines.find(l => l.startsWith('progress_total ='));
  if (progressMatch) {
    const total = progressMatch.replace('progress_total =', '').trim();
    tsLines.push(`  // Quest: progress_total = ${total}`);
  }

  tsLines.push(`});`);
  tsLines.push('');
}

function extractBlock(lines: string[], keyword: string): string | null {
  const startIdx = lines.findIndex(l => l.startsWith(`${keyword} =`));
  if (startIdx === -1) return null;

  // Check if it's a simple one-liner
  const line = lines[startIdx];
  if (!line.includes('(') || line.includes(')')) {
    return line.replace(`${keyword} =`, '').trim();
  }

  // Multi-line block
  let depth = 0;
  let content = '';
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i];
    depth += (l.match(/\(/g) || []).length;
    depth -= (l.match(/\)/g) || []).length;
    content += l + '\n';
    if (depth === 0 && i > startIdx) break;
  }
  return content;
}

function translateSet(setName: string) {
  const pyPath = path.join(FIREPLACE_PATH, setName);
  const outPath = path.join(OUTPUT_PATH, setName);

  if (!fs.existsSync(pyPath)) {
    console.log(`❌ Source directory not found: ${pyPath}`);
    return;
  }

  // Create output directory
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath, { recursive: true });
  }

  // Get Python files
  const files = fs.readdirSync(pyPath)
    .filter(f => f.endsWith('.py') && f !== '__init__.py')
    .sort();

  console.log(`\n📦 Translating ${setName} (${files.length} files)`);

  const allCardIds: string[] = [];

  for (const file of files) {
    const pyFile = path.join(pyPath, file);
    const tsFile = path.join(outPath, file.replace('.py', '.ts'));

    console.log(`  📄 ${file}...`);

    const pythonContent = fs.readFileSync(pyFile, 'utf-8');
    const tsContent = translatePythonToTypeScript(pythonContent, setName);

    // Count card IDs
    const matches = pythonContent.match(/class\s+(\w+)\s*:/g);
    if (matches) {
      for (const m of matches) {
        const id = m.match(/class\s+(\w+)/)?.[1];
        if (id) allCardIds.push(id);
      }
    }

    fs.writeFileSync(tsFile, tsContent);
    console.log(`    ✅ Created ${path.basename(tsFile)} (${allCardIds.length} cards so far)`);
  }

  // Create index.ts
  const indexLines = [
    `// ${setName} - Card Scripts Index`,
    '',
    ...files.map(f => `export * from './${f.replace('.py', '')}';`),
    '',
    `console.log('[${setName}] Registered ${allCardIds.length} cards');`
  ];
  fs.writeFileSync(path.join(outPath, 'index.ts'), indexLines.join('\n'));

  console.log(`\n✅ Completed ${setName}! (${allCardIds.length} cards)`);
}

// Main
const sets = process.argv.slice(2);
if (sets.length === 0) {
  console.log('Usage: npx ts-node scripts/translate-set.ts <set-name> [set-name-2] ...');
  console.log('Example: npx ts-node scripts/translate-set.ts ungoro icecrown');
  process.exit(1);
}

for (const set of sets) {
  translateSet(set);
}
