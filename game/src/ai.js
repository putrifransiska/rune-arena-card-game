// Rune Arena — AI opponent decision making
// Chooses which cards to play and where, with varying strategy levels.

import { MAX_LANES, playCard, PHASE } from './game.js';

// AI makes its play decisions
export function aiPlay(state) {
  if (state.turnOwner !== 'opponent') return;
  if (state.phase !== PHASE.PLAY) return;
  if (state.winner) return;

  const p = state.opponent;

  // Strategy: fill empty lanes first with best cards, then consider replacing weaker cards
  // Sort hand by power/cost ratio (best value first)
  const playable = p.hand
    .map((card, idx) => ({ card, idx }))
    .filter(({ card }) => card.cost <= p.energy);

  if (playable.length === 0) return;

  // Sort by power descending (prefer stronger cards)
  playable.sort((a, b) => b.card.power - a.card.power);

  // Try to fill empty lanes first
  for (const { card, idx } of playable) {
    for (let lane = 0; lane < MAX_LANES; lane++) {
      if (p.lanes[lane] === null) {
        if (playCard(state, 'opponent', p.hand.indexOf(card), lane)) {
          return; // Play one card per AI tick
        }
      }
    }
  }

  // If all lanes filled, consider replacing weakest card
  // Find the weakest lane
  let weakestLane = -1;
  let weakestPower = Infinity;
  for (let lane = 0; lane < MAX_LANES; lane++) {
    if (p.lanes[lane] && p.lanes[lane].power < weakestPower) {
      weakestPower = p.lanes[lane].power;
      weakestLane = lane;
    }
  }

  // Replace if we have a stronger card
  if (weakestLane >= 0) {
    for (const { card } of playable) {
      if (card.power > weakestPower) {
        // Discard the weak card, play the strong one
        p.discard.push(p.lanes[weakestLane]);
        p.lanes[weakestLane] = null;
        if (playCard(state, 'opponent', p.hand.indexOf(card), weakestLane)) {
          return;
        }
      }
    }
  }
}