// Rune Arena - canvas rendering system
import { SUITS } from './cards.js';
import { MAX_LANES, PHASE } from './game.js';

export const W = 960;
export const H = 640;
const CARD_W = 100;
const CARD_H = 140;

const BG = '#0d0d2b';
const TABLE_BG = '#1a1a3e';
const TABLE_EDGE = '#2a2a5e';
const TEXT_COLOR = '#e8e8f0';
const DIM_TEXT = '#8888aa';
const GOLD = '#f0c040';
const HP_RED = '#e04040';
const HP_GREEN = '#40e040';
const ENERGY_BLUE = '#4080e0';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function initRenderer(canvas) {
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  return ctx;
}

function drawCardBack(ctx, x, y) {
  roundRect(ctx, x, y, CARD_W, CARD_H, 8);
  var grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
  grad.addColorStop(0, '#1a1a45');
  grad.addColorStop(1, '#0e0e30');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#3a3a6a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#282860';
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 2; c++) {
      ctx.beginPath();
      ctx.arc(x + 22 + c * 48, y + 22 + r * 44, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#4040a0';
  ctx.beginPath();
  ctx.arc(x + CARD_W / 2, y + CARD_H / 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a45';
  ctx.beginPath();
  ctx.arc(x + CARD_W / 2, y + CARD_H / 2, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawCardFace(ctx, x, y, card, alpha, liftY) {
  if (alpha === undefined) alpha = 1;
  if (liftY === undefined) liftY = 0;
  var wy = y + liftY;
  ctx.save();
  ctx.globalAlpha = alpha;

  var suit = SUITS[card.suit];
  var isSpell = card.type === 'spell';

  // Card body
  roundRect(ctx, x, wy, CARD_W, CARD_H, 8);
  var bodyGrad = ctx.createLinearGradient(x, wy, x + CARD_W, wy + CARD_H);
  bodyGrad.addColorStop(0, isSpell ? '#2a1a3e' : '#1a1a3e');
  bodyGrad.addColorStop(1, isSpell ? '#1a0a2e' : '#0e0e2e');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Suit color border
  ctx.strokeStyle = suit.color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Suit icon header bar
  ctx.fillStyle = suit.dark;
  roundRect(ctx, x + 4, wy + 4, CARD_W - 8, 28, 4);
  ctx.fill();
  ctx.fillStyle = suit.color;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(suit.icon + ' ' + suit.name, x + CARD_W / 2, wy + 24);

  // Card name
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(card.name, x + CARD_W / 2, wy + 55);

  // Power value (large)
  ctx.fillStyle = isSpell ? '#e8a0ff' : GOLD;
  ctx.font = 'bold 32px sans-serif';
  var powerText = card.power.toString();
  ctx.fillText(powerText, x + CARD_W / 2, wy + 95);

  // Power label
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '9px sans-serif';
  ctx.fillText(isSpell ? 'EFFECT' : 'POWER', x + CARD_W / 2, wy + 110);

  // Cost badge (bottom right)
  ctx.fillStyle = ENERGY_BLUE;
  ctx.beginPath();
  ctx.arc(x + CARD_W - 14, wy + CARD_H - 14, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(card.cost.toString(), x + CARD_W - 14, wy + CARD_H - 9);

  // Type indicator for spells
  if (isSpell) {
    ctx.fillStyle = 'rgba(232, 160, 255, 0.3)';
    roundRect(ctx, x + 8, wy + CARD_H - 28, CARD_W - 16, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#e8a0ff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('SPELL', x + CARD_W / 2, wy + CARD_H - 13);
  }

  ctx.restore();
}

function drawCard(ctx, x, y, card, faceUp, alpha, liftY) {
  if (!card) {
    // Empty slot outline
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, CARD_W, CARD_H, 8);
    ctx.stroke();
    ctx.setLineDash([]);
    // Lane number
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty', x + CARD_W / 2, y + CARD_H / 2);
    ctx.restore();
    return;
  }
  if (faceUp === false) {
    drawCardBack(ctx, x, y);
  } else {
    drawCardFace(ctx, x, y, card, alpha, liftY);
  }
}

export function drawTitleScreen(ctx, time) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  var t = time * 0.001;

  // Stars
  ctx.fillStyle = '#fff';
  for (var i = 0; i < 80; i++) {
    var sx = (Math.sin(i * 127.1 + t * 0.3) * 0.5 + 0.5) * W;
    var sy = (Math.cos(i * 311.7 + t * 0.2) * 0.5 + 0.5) * H;
    var sr = 0.5 + Math.sin(i * 73 + t) * 0.5;
    ctx.globalAlpha = 0.3 + sr * 0.7;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Central glow
  ctx.fillStyle = 'rgba(64, 64, 160, 0.08)';
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 350, 200, 0, 0, Math.PI * 2);
  ctx.fill();

  // Title
  var titleY = 200 + Math.sin(t * 2) * 5;
  ctx.fillStyle = '#f0d060';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RUNE ARENA', W / 2, titleY);
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '16px sans-serif';
  ctx.fillText('Tactical Card Dueling', W / 2, titleY + 35);

  // Decorative cards
  var cx1 = W / 2 - 180, cx2 = W / 2 + 80;
  var cy = 310 + Math.sin(t * 1.5) * 8;
  ctx.save();
  ctx.translate(cx1, cy);
  ctx.rotate(-0.15 + Math.sin(t) * 0.05);
  drawCardFace(ctx, -50, -70, { name: 'Phoenix', suit: 'flame', power: 6, cost: 4, type: 'creature' }, 0.9, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(cx2, cy + 10);
  ctx.rotate(0.12 + Math.cos(t * 1.3) * 0.05);
  drawCardFace(ctx, -50, -70, { name: 'Kraken', suit: 'tide', power: 7, cost: 5, type: 'creature' }, 0.9, 0);
  ctx.restore();

  // Suit legend
  var suits = ['flame', 'tide', 'stone', 'wind'];
  var legendY = 460;
  ctx.font = '13px sans-serif';
  for (var s = 0; s < 4; s++) {
    var sxPos = W / 2 + (s - 1.5) * 100;
    ctx.fillStyle = SUITS[suits[s]].color;
    ctx.fillText(SUITS[suits[s]].icon + ' ' + SUITS[suits[s]].name, sxPos, legendY);
  }

  // Advantage hint
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '11px sans-serif';
  ctx.fillText('Advantages: Flame > Wind > Stone > Tide > Flame', W / 2, legendY + 28);

  // Start prompt
  var pulse = 0.6 + Math.sin(t * 3) * 0.4;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press SPACE or Click to Start', W / 2, H - 60);
  ctx.globalAlpha = 1;
}

export function drawGameScreen(ctx, state) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Table surface
  ctx.fillStyle = TABLE_BG;
  roundRect(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.fill();
  ctx.strokeStyle = TABLE_EDGE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Opponent HP
  ctx.fillStyle = HP_RED;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Opponent HP: ' + Math.max(0, state.opponent.hp), 50, 55);
  var hpBarW = 200;
  var hpRatio = Math.max(0, state.opponent.hp / 25);
  ctx.fillStyle = '#333';
  ctx.fillRect(50, 62, hpBarW, 12);
  ctx.fillStyle = hpRatio > 0.3 ? HP_GREEN : HP_RED;
  ctx.fillRect(50, 62, hpBarW * hpRatio, 12);

  // Opponent info
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Hand: ' + state.opponent.hand.length, W - 50, 55);
  ctx.fillStyle = ENERGY_BLUE;
  ctx.fillText('Energy: ' + state.opponent.energy + '/' + state.opponent.energyMax, W - 50, 75);

  // Opponent hand (face down)
  for (var i = 0; i < Math.min(state.opponent.hand.length, 6); i++) {
    drawCardBack(ctx, W - 430 + i * 40, 15);
  }// Opponent field lanes
  for (var l = 0; l < MAX_LANES; l++) {
    var olx = 220 + l * 180;
    var oly = 95;
    drawCard(ctx, olx, oly, state.opponent.lanes[l], true, 1, 0);
  }

  // Lane labels
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  for (var l2 = 0; l2 < MAX_LANES; l2++) {
    ctx.fillText('Lane ' + (l2 + 1), 270 + l2 * 180, 90);
  }

  // Center divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(40, 250);
  ctx.lineTo(W - 40, 250);
  ctx.stroke();
  ctx.setLineDash([]);

  // Turn info
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  var turnText = state.turnOwner === 'player' ? 'YOUR TURN' : 'OPPONENT TURN';
  ctx.fillText('Turn ' + state.turn + ' - ' + turnText, W / 2, 270);

  // Round timer
  var tLeft = Math.max(0, Math.ceil(state.turnTimeLeft || 0));
  var timerColor = tLeft <= 10 ? '#ff4444' : (tLeft <= 20 ? '#ffaa44' : '#aaffaa');
  ctx.fillStyle = timerColor;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Time: ' + tLeft + 's', W / 2, 288);

  // Direction arrow for player turn
  if (state.turnOwner === 'player') {
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(W / 2, 302);
    ctx.lineTo(W / 2 - 10, 292);
    ctx.lineTo(W / 2 + 10, 292);
    ctx.closePath();
    ctx.fill();
  }

  // Player HP
  ctx.fillStyle = HP_GREEN;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Your HP: ' + Math.max(0, state.player.hp), 50, 305);
  var pHpRatio = Math.max(0, state.player.hp / 25);
  ctx.fillStyle = '#333';
  ctx.fillRect(50, 312, hpBarW, 12);
  ctx.fillStyle = pHpRatio > 0.3 ? HP_GREEN : HP_RED;
  ctx.fillRect(50, 312, hpBarW * pHpRatio, 12);

  // Player energy
  ctx.fillStyle = ENERGY_BLUE;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Energy: ' + state.player.energy + ' / ' + state.player.energyMax, W - 50, 305);

  // Player field lanes
  for (var l3 = 0; l3 < MAX_LANES; l3++) {
    var plx = 220 + l3 * 180;
    var ply = 330;
    if (state.turnOwner === 'player' && state.selectedCard !== null && state.player.lanes[l3] === null) {
      ctx.fillStyle = 'rgba(64, 128, 255, 0.15)';
      roundRect(ctx, plx - 2, ply - 2, CARD_W + 4, CARD_H + 4, 10);
      ctx.fill();
    }
    drawCard(ctx, plx, ply, state.player.lanes[l3], true, 1, 0);
  }

  // Player hand
  var handCount = state.player.hand.length;
  if (handCount > 0) {
    var totalW = handCount * CARD_W + (handCount - 1) * 10;
    var startX = W / 2 - totalW / 2;
    var handY = 490;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Your Hand (' + handCount + ' cards)', W / 2, 485);
    for (var h = 0; h < handCount; h++) {
      var cx = startX + h * (CARD_W + 10);
      var lift = (state.selectedCard === h) ? -20 : 0;
      if (state.hoveredCard === h) lift = -10;
      drawCardFace(ctx, cx, handY, state.player.hand[h], 1, lift);
    }
  }

  // Battle button
  var btnX = 780, btnY = 380, btnW = 140, btnH = 45;
  var canBattle = (state.phase === 'PLAY' || state.phase === 'BATTLE_READY') && state.turnOwner === 'player';
  ctx.fillStyle = canBattle ? '#4a8a30' : '#333';
  roundRect(ctx, btnX, btnY, btnW, btnH, 8);
  ctx.fill();
  ctx.strokeStyle = canBattle ? '#6ab040' : '#555';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = canBattle ? '#fff' : '#666';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BATTLE', btnX + btnW / 2, btnY + 30);

  // Deck count
  ctx.fillStyle = DIM_TEXT;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Deck: ' + state.player.deck.length, W - 50, 465);
  ctx.fillText('Discard: ' + state.player.discard.length, W - 50, 482);

  // Message display
  if (state.message && state.messageTimer > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    var msgW = 400, msgH = 30;
    roundRect(ctx, W / 2 - msgW / 2, 255, msgW, msgH, 6);
    ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, W / 2, 276);
  }
}