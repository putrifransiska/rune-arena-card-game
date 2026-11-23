// Rune Arena — game state management, rules, and game logic
// Manages the state for both players, lanes, turns, and combat resolution.

import { buildDeck, hasAdvantage } from './cards.js';

export const MAX_HAND = 6;
export const MAX_LANES = 3;
export const STARTING_HP = 25;
export const STARTING_ENERGY_MAX = 4;

// Game phases
export const PHASE = {
  DRAW: 'draw',
  PLAY: 'play',
  BATTLE: 'battle',
  END: 'end',
};

// Create initial state
export function createGameState() {
  return {
    player: {
      hp: STARTING_HP,
      energy: STARTING_ENERGY_MAX,
      energyMax: STARTING_ENERGY_MAX,
      deck: buildDeck(),
      hand: [],
      lanes: [null, null, null], // cards on the field, one per lane
      discard: [],
    },
    opponent: {
      hp: STARTING_HP,
      energy: STARTING_ENERGY_MAX,
      energyMax: STARTING_ENERGY_MAX,
      deck: buildDeck(),
      hand: [],
      lanes: [null, null, null],
      discard: [],
    },
    phase: PHASE.DRAW,
    turn: 1,
    turnOwner: 'player', // 'player' or 'opponent'
    winner: null, // null, 'player', or 'opponent'
    message: '',
    messageTimer: 0,
    animating: false,
    animationQueue: [],
    selectedCard: null, // index in player's hand
    hoveredCard: null,
    hoveredLane: -1,
    battleLog: [],
    turnTimeLeft: 45,
    turnTimeMax: 45,
  };
}

// Draw a card for a player
export function drawCard(state, who) {
  const p = state[who];
  if (p.deck.length === 0) {
    // Reshuffle discard into deck
    if (p.discard.length === 0) return false;
    p.deck = [...p.discard];
    p.discard = [];
    for (let i = p.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p.deck[i], p.deck[j]] = [p.deck[j], p.deck[i]];
    }
  }
  if (p.hand.length >= MAX_HAND) return false;
  const card = p.deck.pop();
  p.hand.push(card);
  return true;
}

// Check if a lane is empty for a player
export function laneEmpty(state, who, lane) {
  return state[who].lanes[lane] === null;
}

// Play a card from hand to a lane
export function playCard(state, who, handIndex, lane) {
  const p = state[who];
  if (handIndex < 0 || handIndex >= p.hand.length) return false;
  const card = p.hand[handIndex];
  if (card.cost > p.energy) return false;
  if (p.lanes[lane] !== null) return false;

  p.energy -= card.cost;
  p.hand.splice(handIndex, 1);
  p.lanes[lane] = card;
  return true;
}

// Resolve combat in one lane
export function resolveLaneCombat(state, lane, attacker, defender, log) {
  const attackerCard = state[attacker].lanes[lane];
  const defenderCard = state[defender].lanes[lane];

  if (!attackerCard && !defenderCard) return;

  if (attackerCard && !defenderCard) {
    // Direct damage to defender
    const dmg = attackerCard.power;
    state[defender].hp -= dmg;
    log.push(`${attackerCard.name} hits ${defender} for ${dmg} damage!`);
    return;
  }

  if (!attackerCard && defenderCard) {
    return; // defender's card stays, no attack
  }

  // Both have cards — they fight
  let attackerPower = attackerCard.power;
  let defenderPower = defenderCard.power;

  if (hasAdvantage(attackerCard, defenderCard)) {
    attackerPower += 2;
    log.push(`${attackerCard.name} has advantage over ${defenderCard.name}!`);
  }
  if (hasAdvantage(defenderCard, attackerCard)) {
    defenderPower += 2;
    log.push(`${defenderCard.name} has advantage over ${attackerCard.name}!`);
  }

  if (attackerPower > defenderPower) {
    state[defender].discard.push(defenderCard);
    state[defender].lanes[lane] = null;
    const overflow = attackerPower - defenderPower;
    state[defender].hp -= overflow;
    log.push(`${attackerCard.name} (${attackerPower}) defeats ${defenderCard.name} (${defenderPower}), deals ${overflow} overflow!`);
  } else if (defenderPower > attackerPower) {
    state[attacker].discard.push(attackerCard);
    state[attacker].lanes[lane] = null;
    const overflow = defenderPower - attackerPower;
    state[attacker].hp -= overflow;
    log.push(`${defenderCard.name} (${defenderPower}) defeats ${attackerCard.name} (${attackerPower}), deals ${overflow} overflow!`);
  } else {
    // Tie — both destroyed
    state[attacker].discard.push(attackerCard);
    state[attacker].lanes[lane] = null;
    state[defender].discard.push(defenderCard);
    state[defender].lanes[lane] = null;
    log.push(`${attackerCard.name} and ${defenderCard.name} destroy each other!`);
  }
}

// Run the battle phase for the current turn owner
export function runBattle(state) {
  const log = [];
  const attacker = state.turnOwner;
  const defender = attacker === 'player' ? 'opponent' : 'player';

  for (let lane = 0; lane < MAX_LANES; lane++) {
    resolveLaneCombat(state, lane, attacker, defender, log);
  }

  state.battleLog = log;

  // Check win condition
  if (state.player.hp <= 0) {
    state.winner = 'opponent';
  } else if (state.opponent.hp <= 0) {
    state.winner = 'player';
  }

  return log;
}

// Advance to the next turn
export function nextTurn(state) {
  state.turn++;
  state.turnOwner = state.turnOwner === 'player' ? 'opponent' : 'player';
  const p = state[state.turnOwner];

  // Increase energy cap every other turn
  if (state.turn % 2 === 0 && p.energyMax < 10) {
    p.energyMax++;
  }

  // Refill energy
  p.energy = p.energyMax;

  // Draw a card
  drawCard(state, state.turnOwner);

  state.phase = PHASE.PLAY;
  state.selectedCard = null;
  state.battleLog = [];
  state.turnTimeLeft = 45;
  state.turnTimeMax = 45;
  state.message = state.turnOwner === 'player' ? 'Your turn — play cards!' : "Opponent's turn...";
  state.messageTimer = 60;
}

// Start the first turn
export function startFirstTurn(state) {
  // Draw initial hands
  for (let i = 0; i < 3; i++) {
    drawCard(state, 'player');
    drawCard(state, 'opponent');
  }
  state.player.energy = state.player.energyMax;
  state.phase = PHASE.PLAY;
  state.message = 'Your turn — play cards!';
  state.messageTimer = 90;
  state.turnTimeLeft = 45;
  state.turnTimeMax = 45;
}