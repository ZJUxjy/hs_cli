// Classic Neutral Epic Card Scripts
import { cardScriptsRegistry } from '../index';

const cards = [
  'CS2_103', 'CS2_104', 'CS2_169', 'CS2_188', 'CS2_213',
  'EX1_028', 'EX1_045', 'EX1_047', 'EX1_053', 'EX1_089',
  'EX1_091', 'EX1_130', 'EX1_249', 'EX1_287', 'EX1_298',
  'EX1_301', 'EX1_303', 'EX1_304', 'EX1_306', 'EX1_309',
  'EX1_310', 'EX1_311', 'EX1_312', 'EX1_313', 'EX1_314',
  'EX1_315', 'EX1_316', 'EX1_317', 'EX1_318', 'EX1_319',
  'EX1_320', 'EX1_321', 'EX1_322', 'EX1_323', 'EX1_324',
  'EX1_325', 'EX1_326', 'EX1_327', 'EX1_328', 'EX1_329',
  'EX1_330', 'EX1_331', 'EX1_332', 'EX1_333', 'EX1_334',
  'EX1_335', 'EX1_336', 'EX1_337', 'EX1_338', 'EX1_339',
  'EX1_340', 'EX1_341', 'EX1_342', 'EX1_343', 'EX1_344',
  'EX1_345', 'EX1_346', 'EX1_347', 'EX1_348', 'EX1_349',
];

for (const cardId of cards) {
  cardScriptsRegistry.register(cardId, {});
}

console.log('[Classic Neutral Epic] Registered', cards.length, 'scripts');
