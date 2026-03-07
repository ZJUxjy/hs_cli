#!/usr/bin/env ts
/**
 * Simple-translate.ts
 * A simple script to translate Python fireplace card scripts to TypeScript
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const FIREPLACE_PATH = '/home/xu/code/hstone/hearthstone/fireplace/fireplace/cards';
const JS_FIREPLACE_PATH = '/home/xu/code/hstone/hearthstone/js_fireplace/src/cards/mechanics';

// Get all expansion sets
const EXPANSION_SETS = [
  { name: 'ungoro', displayName: "Journey to Un'Goro", priority: 'high' },
  { name: 'icecrown', displayName: "Knights of the Frozen Throne", priority: 'high' },
  { name: 'witchwood', displayName: "The Witchwood", priority: 'medium' },
  { name: 'boomsday', displayName: "The Boomsday Project", priority: 'medium' },
  { name: 'kobolds', displayName: "Kobolds & Catacombs", priority: 'medium' },
  { name: 'dalaran', displayName: "Rise of Shadows", priority: 'medium' },
  { name: 'dragons', displayName: "Descent of Dragons", priority: 'medium' },
  { name: 'scholomance', displayName: "Scholomance Academy", priority: 'medium' },
  { name: 'troll', displayName: "Rastakhan's Rumble", priority: 'low' },
  { name: 'uldum', displayName: "Saviors of Uldum", priority: 'low' },
  { name: 'outlands', displayName: "Ashes of Outland", priority: 'low' },
  { name: 'initiate', displayName: "Demon Hunter Initiate", priority: 'low' },
];

// Get translation status
function getTranslationStatus() {
  const status = {
    completed: [] as string[],
    inProgress: [] as string[],
    pending: [] as string[],
  };

  for (const set of EXPANSION_SETS) {
    const jsPath = path.join(JS_FIREPLACE_PATH, set.name);
    if (fs.existsSync(jsPath)) {
      status.completed.push(set.name);
    } else {
      status.pending.push(set.name);
    }
  }

  return status;
}

// Get Python files for a set
function getPythonFiles(setName: string): string[] {
  const pyPath = path.join(FIREPLACE_PATH, setName);
    if (!fs.existsSync(pyPath)) {
    return [];
  }

  const files = fs.readdirSync(pyPath)
    .filter(f => f.endsWith('.py') && f !== '__init__.py')
    .map(f => f);

  return files;
}

// Translate a single file
function translateFile(setName: string, fileName: string): void {
  const pyFile = path.join(FIREPLACE_PATH, setName, fileName);
  const tsFile = path.join(JS_FIREPLACE_PATH, setName, fileName.replace('.py', '.ts'));

  console.log(`  📄 Translating ${fileName}...`);

  // Read Python content
  const pythonContent = fs.readFileSync(pyFile, 'utf-8');
  const lines = pythonContent.split('\n')

  // Generate TypeScript content
  const tsLines: string[] = []
  tsLines.push(`// ${setName} Card Scripts`)
  tsLines.push(`// Translated from Python fireplace`)
    tsLines.push('')
    tsLines.push(`import { cardScriptsRegistry } from '../index';`)
    tsLines.push('')

    let currentCard: { id: string; name: string; hasEffect: boolean } | null = null
    let inClass = false

    for (const line of lines) {
      // Check for class definition with docstring
      const classMatch = line.match(/^class\s+(\w+)\s*:\s*"""([^"]+)"""/);
      if (classMatch) {
        if (currentCard && currentCard.id) {
          tsLines.push(`// ${currentCard.id} - ${currentCard.name}`)
          tsLines.push(`cardScriptsRegistry.register('${currentCard.id}', {`)
        } else if (line.match(/^class\s+(\w+)\s*:/)) {
        // Class without docstring - extract ID only
        const classMatch = line.match(/^class\s+(\w+)\s*:/);
        if (classMatch) {
          const cardId = classMatch[1]
          tsLines.push(`// ${cardId}`)
          tsLines.push(`cardScriptsRegistry.register('${cardId}', {`)
          currentCard = { id: cardId, name: '', hasEffect: false }
        }
      }

      // Check for play effect
      if (line.match(/^\s+play\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  play: (ctx: any) => {')
        tsLines.push('    // TODO: Implement play effect')
        tsLines.push('  },')
        continue
      }

      // Check for deathrattle
      if (line.match(/^\s+deathrattle\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  deathrattle: (ctx: any) => {')
        tsLines.push('    // TODO: Implement deathrattle effect')
        tsLines.push('  },')
        continue
      }

      // Check for events
      if (line.match(/^\s+events\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  events: {')
        tsLines.push('    // TODO: Implement events')
        tsLines.push('  },')
        continue
      }

      // Check for inspire
      if (line.match(/^\s+inspire\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  inspire: (ctx: any) => {')
        tsLines.push('    // TODO: Implement inspire effect')
        tsLines.push('  },')
        continue
      }

      // Check for trigger
      if (line.match(/^\s+trigger\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  trigger: (ctx: any) => {')
        tsLines.push('    // TODO: Implement trigger effect')
        tsLines.push('  },')
        continue
      }

      // Check for choose
      if (line.match(/^\s+choose\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  // Choose cards effect')
        tsLines.push('  choose: [],')
        continue
      }

      // Check for requirements
      if (line.match(/^\s+requirements\s*=/)) {
        currentCard!.hasEffect = true
        tsLines.push('  // Requirements')
        tsLines.push('  requirements: {},')
        continue
      }

      // End of class
      if (line.match(/^$/) && currentCard) {
        tsLines.push('});')
        tsLines.push('')
        currentCard = null
      }
    }

    // Close last card if open
    if (currentCard) {
      tsLines.push('});')
      tsLines.push('')
    }

    // Write file
    const dir = path.dirname(tsFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(tsFile, tsLines.join('\n'))
    console.log(`  ✅ Created ${path.basename(tsFile)}`)
  }
}

// Create index.ts for a set
function createIndexFile(setName: string, files: string[]): void {
  const indexPath = path.join(JS_FIREPLACE_PATH, setName, 'index.ts')

  const indexLines: string[] = []
  indexLines.push(`// ${setName} - Card Scripts Index`)
  indexLines.push('')

  for (const file of files) {
    const baseName = file.replace('.py', '')
    indexLines.push(`export * from './${baseName}';`)
  }

  indexLines.push('')
  indexLines.push(`console.log('[${setName}] Registered all card scripts');`)

  fs.writeFileSync(indexPath, indexLines.join('\n'))
    console.log(`  ✅ Created index.ts`)
  }

// Main translation function
function translateSet(set: typeof EXPANSION_SETS[0]): void {
  console.log(`\n📦 Translating ${set.displayName} (${set.name})...`)

  // Get Python files
  const files = getPythonFiles(set.name)
  if (files.length === 0) {
    console.log('  ⚠️ No Python files found')
    return
  }

  console.log(`  📄 Found ${files.length} files to translate`)

  // Create output directory
  const outputPath = path.join(JS_FIREPLACE_PATH, set.name)
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
    }

  // Translate each file
  for (const file of files) {
    translateFile(set.name, file)
  }

  // Create index.ts
  createIndexFile(set.name, files)

  console.log(`\n✅ Completed ${set.displayName}!`)
}

// Main
function main() {
  console.log('🚀 Fireplace Translation Agent')
  console.log('=========================\n')

  // Get status
  const status = getTranslationStatus()
  console.log(`📊 Translation Status:`)
  console.log(`   ✅ Completed: ${status.completed.length}`)
  console.log(`   ⏳ Pending: ${status.pending.length}`)
  console.log('')

  // Get next set to translate
  const nextSet = EXPANSION_SETS.find(s => status.pending.includes(s.name))

  if (!nextSet) {
    console.log('✅ All sets have been translated!')
    return
  }

  console.log(`🎯 Next set: ${nextSet.displayName} (${nextSet.name})`)

  // Translate the set
  translateSet(nextSet)

  // Show updated status
  const newStatus = getTranslationStatus()
  console.log(`\n📊 Updated Status:`)
  console.log(`   ✅ Completed: ${newStatus.completed.length}`)
  console.log(`   ⏳ Pending: ${newStatus.pending.length}`)

  if (newStatus.pending.length > 0) {
    console.log(`\n💡 To continue, run: npm ts-node scripts/simple-translate.ts`)
  }
}

main()
