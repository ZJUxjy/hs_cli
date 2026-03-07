#!/usr/bin/env ts-node
// Interactive Hearthstone game runner

import { Game } from './core';
import { Player } from './core/player';
import { CardLoader } from './cards/loader';
import { PlayState } from './enums';
import * as path from 'path';
import * as readline from 'readline';

// Load card definitions
console.log('Loading cards...');
const xmlPath = path.join(__dirname, '..', 'src', 'cards', 'CardDefs.xml');
CardLoader.loadFromXml(xmlPath);
console.log(`Loaded ${CardLoader.getAll().length} cards`);

// Create players with simple decks
const player1Deck = [
  'CS2_168', // Murloc Raider
  'CS2_168', 'CS2_171', 'CS2_171', 'CS1_042', 'CS1_042',
  'CS2_121', 'CS2_121', 'CS2_122', 'CS2_122', 'CS2_124', 'CS2_124',
  'CS2_142', 'CS2_142', 'CS2_141', 'CS2_141', 'CS2_147', 'CS2_147',
  'CS2_131', 'CS2_131', 'CS2_125', 'CS2_125', 'CS2_187', 'CS2_187',
  'CS2_189', 'CS2_189', 'CS2_203', 'CS2_203', 'CS2_119', 'CS2_119',
];

const player2Deck = [
  'CS2_168', // Murloc Raider
  'CS2_168', 'CS2_171', 'CS2_171', 'CS1_042', 'CS1_042',
  'CS2_121', 'CS2_121', 'CS2_122', 'CS2_122', 'CS2_124', 'CS2_124',
  'CS2_142', 'CS2_142', 'CS2_141', 'CS2_141', 'CS2_147', 'CS2_147',
  'CS2_131', 'CS2_131', 'CS2_125', 'CS2_125', 'CS2_187', 'CS2_187',
  'CS2_189', 'CS2_189', 'CS2_203', 'CS2_203', 'CS2_119', 'CS2_119',
];

// Create players with hero cards
const player1 = new Player('Player 1', player1Deck);
const player2 = new Player('Player 2', player2Deck);

// Set heroes (Jaina for P1, Garrosh for P2)
player1.startingHero = 'HERO_08'; // Jaina Proudmoore (Mage)
player2.startingHero = 'HERO_01'; // Garrosh Hellscream (Warrior)

// Create game
const game = new Game({
  players: [player1, player2],
  seed: Date.now(),
});

// Start the game
game.start();

console.log('\n=== Hearthstone JS Fireplace ===');
console.log('Game started! Type "help" for commands.\n');

// Display game state
function showGameState(): void {
  const current = game.currentPlayer;
  if (!current) return;

  console.log('\n' + '='.repeat(50));
  console.log(`Turn ${game.turn}: ${current.name}'s turn`);
  console.log(`Mana: ${current.mana}/${current.maxMana}`);
  console.log('='.repeat(50));

  // Show Player 1 info
  console.log(`\n${player1.name} (${player1.firstPlayer ? 'First' : 'Second'})`);
  if (player1.hero) {
    const hero = player1.hero as any;
    console.log(`  Hero: ${hero.name} (${hero.id}) - HP: ${hero.health - (hero.damage || 0)}/${hero.health}`);
  }
  console.log(`  Deck: ${player1.deck.length} cards`);
  console.log(`  Hand: ${player1.hand.length} cards`);
  player1.hand.forEach((card, i) => {
    console.log(`    [${i}] ${card.id} - ${card.name} (Cost: ${card.cost})`);
  });
  console.log(`  Field: ${player1.field.length} minions`);
  player1.field.forEach((minion, i) => {
    const m = minion as any;
    console.log(`    [${i}] ${minion.id} - ${minion.name} ${m.attack}/${m.health - (m.damage || 0)}`);
  });

  // Show Player 2 info
  console.log(`\n${player2.name} (${player2.firstPlayer ? 'First' : 'Second'})`);
  if (player2.hero) {
    const hero = player2.hero as any;
    console.log(`  Hero: ${hero.name} (${hero.id}) - HP: ${hero.health - (hero.damage || 0)}/${hero.health}`);
  }
  console.log(`  Deck: ${player2.deck.length} cards`);
  console.log(`  Hand: ${player2.hand.length} cards`);
  player2.hand.forEach((card, i) => {
    console.log(`    [${i}] ${card.id} - ${card.name} (Cost: ${card.cost})`);
  });
  console.log(`  Field: ${player2.field.length} minions`);
  player2.field.forEach((minion, i) => {
    const m = minion as any;
    console.log(`    [${i}] ${minion.id} - ${minion.name} ${m.attack}/${m.health - (m.damage || 0)}`);
  });

  console.log('\n' + '='.repeat(50));
}

// Command interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: game.currentPlayer?.name + '> '
});

function updatePrompt(): void {
  rl.setPrompt(game.currentPlayer?.name + '> ');
  rl.prompt();
}

showGameState();
updatePrompt();

rl.on('line', (line: string) => {
  const args = line.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  switch (command) {
    case 'help':
      console.log('Commands:');
      console.log('  play <hand_index> [target] - Play a card from hand');
      console.log('  attack <from> <to>         - Attack with a minion or hero');
      console.log('  hero                       - Use hero power');
      console.log('  end                        - End your turn');
      console.log('  show                       - Show game state');
      console.log('  concede                    - Concede the game');
      console.log('  quit                       - Exit the game');
      break;

    case 'show':
      showGameState();
      break;

    case 'end':
      game.endTurn();
      console.log(`Turn ended. Now ${game.currentPlayer?.name}'s turn.`);
      showGameState();
      break;

    case 'concede':
      if (game.currentPlayer) {
        game.currentPlayer.concede();
      }
      break;

    case 'quit':
    case 'exit':
      rl.close();
      return;

    case 'play': {
      const handIdx = parseInt(args[1]);
      const current = game.currentPlayer;
      if (!current || isNaN(handIdx) || handIdx < 0 || handIdx >= current.hand.length) {
        console.log('Invalid hand index');
        break;
      }

      const card = current.hand.at(handIdx);
      if (!card) {
        console.log('Card not found in hand');
        break;
      }

      if (!current.canPayCost(card)) {
        console.log('Not enough mana');
        break;
      }

      // Play the card
      const { Play } = require('./actions/play');
      const playAction = new Play(current, card);
      game.queueActions(current, [playAction]);

      console.log(`Played ${card.id}`);
      showGameState();
      break;
    }

    case 'attack': {
      const attackerIdx = parseInt(args[1]);
      const defenderIdx = parseInt(args[2]);
      const current = game.currentPlayer;

      if (!current || isNaN(attackerIdx) || isNaN(defenderIdx)) {
        console.log('Usage: attack <attacker_field_index> <defender_field_index>');
        break;
      }

      const attacker = current.field.at(attackerIdx);
      const defender = current.opponent.field.at(defenderIdx);

      if (!attacker || !defender) {
        console.log('Invalid attacker or defender');
        break;
      }

      // Attack logic would go here
      console.log(`${attacker.id} attacks ${defender.id}`);
      break;
    }

    case 'hero':
      console.log('Hero power not yet implemented');
      break;

    case '':
      break;

    default:
      console.log(`Unknown command: ${command}. Type "help" for available commands.`);
  }

  // Check for game over
  if (game.ended) {
    console.log('\n=== GAME OVER ===');
    player1.playstate === PlayState.WON && console.log(`${player1.name} WINS!`);
    player2.playstate === PlayState.WON && console.log(`${player2.name} WINS!`);
    rl.close();
    return;
  }

  updatePrompt();
});

rl.on('close', () => {
  console.log('\nThanks for playing!');
  process.exit(0);
});
