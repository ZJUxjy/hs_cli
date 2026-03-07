#!/usr/bin/env ts
/**
 * Translation script - generates compilable TypeScript with proper imports
 */

import * as fs from 'fs';
import * as path from 'path';

const FIREPLACE_PATH = '/home/xu/code/hstone/hearthstone/fireplace/fireplace/cards';
const OUTPUT_PATH = '/home/xu/code/hstone/hearthstone/js_fireplace/src/cards/mechanics';

function translateSet(setName: string) {
  const pyPath = path.join(FIREPLACE_PATH, setName);
  const outPath = path.join(OUTPUT_PATH, setName);

  if (!fs.existsSync(pyPath)) {
    console.log(`❌ Source not found: ${pyPath}`);
    return;
  }

  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath, { recursive: true });
  }

  const files = fs.readdirSync(pyPath)
    .filter(f => f.endsWith('.py') && f !== '__init__.py')
    .sort();

  console.log(`📦 ${setName}: ${files.length} files`);

  const allCards: string[] = [];

  for (const file of files) {
    const pyFile = path.join(pyPath, file);
    const tsFile = path.join(outPath, file.replace('.py', '.ts'));

    const content = fs.readFileSync(pyFile, 'utf-8');
    const lines = content.split('\n');

    const ts: string[] = [];
    ts.push(`// ${setName} - ${file}`);
    ts.push(`import { cardScriptsRegistry, ActionContext } from '../../index';`);
    ts.push(`import { PlayReq } from '../../../enums/playreq';`);
    ts.push('');

    let inClass = false;
    let currentId = '';
    let currentName = '';
    let hasPlay = false;
    let hasDeathrattle = false;
    let hasEvents = false;
    let hasRequirements = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip non-card lines
      if (trimmed.startsWith('from ') || trimmed.startsWith('import ') || trimmed.startsWith('##')) continue;

      // Class definition
      const classMatch = trimmed.match(/^class\s+(\w+)\s*:\s*"""(.+?)"""/);
      const classMatch2 = trimmed.match(/^class\s+(\w+)\s*:/);

      if (classMatch || classMatch2) {
        // Output previous card
        if (currentId) {
          ts.push(`// ${currentId}${currentName ? ` - ${currentName}` : ''}`);
          ts.push(`cardScriptsRegistry.register('${currentId}', {`);
          if (hasRequirements) {
            ts.push(`  requirements: {`);
            ts.push(`    // TODO: add requirements`);
            ts.push(`  },`);
          }
          if (hasPlay) {
            ts.push(`  play: (ctx: ActionContext) => {`);
            ts.push(`    // TODO: implement play effect`);
            ts.push(`  },`);
          }
          if (hasDeathrattle) {
            ts.push(`  deathrattle: (ctx: ActionContext) => {`);
            ts.push(`    // TODO: implement deathrattle`);
            ts.push(`  },`);
          }
          if (hasEvents) {
            ts.push(`  events: {`);
            ts.push(`    // TODO: implement events`);
            ts.push(`  },`);
          }
          ts.push(`});`);
          ts.push('');
          allCards.push(currentId);
        }

        // Start new card
        currentId = classMatch ? classMatch[1] : (classMatch2 ? classMatch2[1] : '');
        currentName = classMatch ? classMatch[2] : '';
        hasPlay = trimmed.includes('play =');
        hasDeathrattle = trimmed.includes('deathrattle =');
        hasEvents = trimmed.includes('events =');
        hasRequirements = trimmed.includes('requirements');
        continue;
      }

      // Check for effects in subsequent lines
      if (currentId) {
        if (trimmed.startsWith('play =') || trimmed.startsWith('    play =')) hasPlay = true;
        if (trimmed.startsWith('deathrattle =') || trimmed.startsWith('    deathrattle =')) hasDeathrattle = true;
        if (trimmed.startsWith('events =') || trimmed.startsWith('    events =')) hasEvents = true;
        if (trimmed.startsWith('requirements =') || trimmed.startsWith('    requirements =')) hasRequirements = true;
      }
    }

    // Output last card
    if (currentId) {
      ts.push(`// ${currentId}${currentName ? ` - ${currentName}` : ''}`);
      ts.push(`cardScriptsRegistry.register('${currentId}', {`);
      if (hasPlay) {
        ts.push(`  play: (ctx: ActionContext) => { /* TODO */ },`);
      }
      if (hasDeathrattle) {
        ts.push(`  deathrattle: (ctx: ActionContext) => { /* TODO */ },`);
      }
      if (hasEvents) {
        ts.push(`  events: { /* TODO */ },`);
      }
      ts.push(`});`);
      ts.push('');
      allCards.push(currentId);
    }

    fs.writeFileSync(tsFile, ts.join('\n'));
  }

  // Create index.ts with proper imports (not exports!)
  const index = [
    `// ${setName} - Card Scripts Index`,
    '',
    ...files.map(f => `import './${f.replace('.py', '')}';`),
    '',
    `console.log('[${setName}] Registered ${allCards.length} cards');`
  ];
  fs.writeFileSync(path.join(outPath, 'index.ts'), index.join('\n'));

  console.log(`  ✅ ${setName}: ${allCards.length} cards`);
}

// Main - translate all sets
const allSets = fs.readdirSync(FIREPLACE_PATH)
  .filter(f => {
    const fp = path.join(FIREPLACE_PATH, f);
    return fs.statSync(fp).isDirectory() && !f.startsWith('.') && f !== 'game' && f !== 'utils.py';
  });

for (const s of allSets) {
  translateSet(s);
}

console.log('\n✅ All translations complete!');
