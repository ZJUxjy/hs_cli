// Core exports
export * from './core';
export * from './utils';
export * from './enums';
export * from './targeting';
export * from './events';

// i18n exports
export { I18n, t, getCardName, getCardDescription } from './i18n';
export type { Locale, LocaleData } from './i18n/types';

// Cards exports
export * from './cards';

// Load card mechanics examples and classic cards
import './cards/mechanics/examples';
import './cards/mechanics/classic/mage';
import './cards/mechanics/classic/druid';
import './cards/mechanics/classic/hunter';
import './cards/mechanics/classic/warrior';
import './cards/mechanics/classic/paladin';
import './cards/mechanics/classic/priest';
import './cards/mechanics/classic/rogue';
import './cards/mechanics/classic/shaman';
import './cards/mechanics/classic/warlock';
import './cards/mechanics/classic/demonhunter';
import './cards/mechanics/classic/neutral_common';
import './cards/mechanics/classic/neutral_legendary';
import './cards/mechanics/classic/neutral_epic';

// Naxxramas cards
import './cards/mechanics/naxxramas';

// GVG (Goblins vs Gnomes) cards
import './cards/mechanics/gvg';

// TGT (The Grand Tournament) cards
import './cards/mechanics/tgt';

// BRM (Blackrock Mountain) cards
import './cards/mechanics/brm';

// WOG (Whispers of the Old Gods) cards
import './cards/mechanics/wog';

// Karazhan cards
import './cards/mechanics/karazhan';

// League of Explorers cards
import './cards/mechanics/league';

// Gangs (Mean Streets of Gadgetzan) cards
import './cards/mechanics/gangs';

// Un'Goro cards
import './cards/mechanics/ungoro';

// Knights of the Frozen Throne (Icecrown)
import './cards/mechanics/icecrown';

// The Witchwood
import './cards/mechanics/witchwood';

// The Boomsday Project
import './cards/mechanics/boomsday';

// Kobolds & Catacombs
import './cards/mechanics/kobolds';

// Rise of Shadows (Dalaran)
import './cards/mechanics/dalaran';

// Descent of Dragons
import './cards/mechanics/dragons';

// Scholomance Academy
import './cards/mechanics/scholomance';

// Rastakhan's Rumble
import './cards/mechanics/troll';

// Saviors of Uldum
import './cards/mechanics/uldum';

// Ashes of Outland
import './cards/mechanics/outlands';

// Demon Hunter Initiate
import './cards/mechanics/initiate';

// Blackrock Mountain
import './cards/mechanics/blackrock';

// Tavern Brawl
import './cards/mechanics/brawl';

// Custom cards
import './cards/mechanics/custom';

// Debug cards
import './cards/mechanics/debug';

// Tutorial cards
import './cards/mechanics/tutorial';

// The Shrouded City
import './cards/mechanics/the_shrounded_city';

// Hero Skins
import './cards/mechanics/skins';
