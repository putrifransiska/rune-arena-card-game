// Rune Arena — card definitions, deck building, and card data
// Each card has a name, suit, power, and energy cost.

export const SUITS = {
  flame:  { name: 'Flame', color: '#e85d3a', dark: '#8b2500', icon: '▲', emoji: '🔥' },
  tide:   { name: 'Tide',  color: '#3a8be8', dark: '#003d8b', icon: '●', emoji: '🌊' },
  stone:  { name: 'Stone', color: '#c4a43e', dark: '#6b5200', icon: '■', emoji: '🪨' },
  wind:   { name: 'Wind',  color: '#4ec45e', dark: '#1b6b20', icon: '◆', emoji: '💨' },
};

// Advantage cycle: flame > wind > stone > tide > flame
export const ADVANTAGE = {
  flame: 'wind',
  wind: 'stone',
  stone: 'tide',
  tide: 'flame',
};

// Types of cards
export const CARD_TYPES = {
  creature: { name: 'Creature', desc: 'Stays on field and attacks' },
  spell:    { name: 'Spell',    desc: 'Immediate effect, then discarded' },
};

// Card definitions
export const CARDS = [
  // Flame cards (offensive, high power)
  { id: 'ember_imp',    name: 'Ember Imp',    suit: 'flame', power: 2, cost: 1, type: 'creature' },
  { id: 'fire_mage',    name: 'Fire Mage',    suit: 'flame', power: 3, cost: 2, type: 'creature' },
  { id: 'inferno_drake',name: 'Inferno Drake',suit: 'flame', power: 5, cost: 3, type: 'creature' },
  { id: 'phoenix',      name: 'Phoenix',      suit: 'flame', power: 6, cost: 4, type: 'creature' },
  { id: 'fireball',     name: 'Fireball',     suit: 'flame', power: 3, cost: 2, type: 'spell' },

  // Tide cards (defensive, healing)
  { id: 'coral_guard',  name: 'Coral Guard',  suit: 'tide', power: 1, cost: 1, type: 'creature' },
  { id: 'wave_knight',  name: 'Wave Knight',  suit: 'tide', power: 3, cost: 2, type: 'creature' },
  { id: 'tide_sage',    name: 'Tide Sage',    suit: 'tide', power: 4, cost: 3, type: 'creature' },
  { id: 'kraken',       name: 'Kraken',       suit: 'tide', power: 7, cost: 5, type: 'creature' },
  { id: 'healing_wave', name: 'Healing Wave', suit: 'tide', power: 0, cost: 2, type: 'spell' },

  // Stone cards (sturdy, high survival)
  { id: 'pebble',       name: 'Pebble',       suit: 'stone', power: 1, cost: 1, type: 'creature' },
  { id: 'golem',        name: 'Golem',        suit: 'stone', power: 4, cost: 3, type: 'creature' },
  { id: 'earth_titan',  name: 'Earth Titan',  suit: 'stone', power: 6, cost: 4, type: 'creature' },
  { id: 'crystal_wyrm', name: 'Crystal Wyrm', suit: 'stone', power: 5, cost: 3, type: 'creature' },
  { id: 'boulder_toss', name: 'Boulder Toss', suit: 'stone', power: 2, cost: 1, type: 'spell' },

  // Wind cards (fast, low cost)
  { id: 'zephyr',       name: 'Zephyr',       suit: 'wind', power: 2, cost: 1, type: 'creature' },
  { id: 'storm_hawk',   name: 'Storm Hawk',   suit: 'wind', power: 3, cost: 2, type: 'creature' },
  { id: 'tempest_mage', name: 'Tempest Mage', suit: 'wind', power: 4, cost: 2, type: 'creature' },
  { id: 'sky_dragon',   name: 'Sky Dragon',   suit: 'wind', power: 5, cost: 3, type: 'creature' },
  { id: 'gust',         name: 'Gust',         suit: 'wind', power: 1, cost: 1, type: 'spell' },
];

// Build a shuffled deck: 2 copies of each creature, 1 of each spell
export function buildDeck() {
  const deck = [];
  for (const card of CARDS) {
    const copies = card.type === 'creature' ? 2 : 1;
    for (let i = 0; i < copies; i++) {
      deck.push({ ...card });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Check suit advantage
export function hasAdvantage(attacker, defender) {
  return ADVANTAGE[attacker.suit] === defender.suit;
}