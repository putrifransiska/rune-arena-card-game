// Rune Arena - main entry point, game loop, scene management
import { W, H, initRenderer, drawTitleScreen, drawGameScreen } from './render.js';
import { createGameState, startFirstTurn, runBattle, nextTurn, PHASE } from './game.js';
import { aiPlay } from './ai.js';
import { ParticleSystem, CardAnimator } from './effects.js';
import { initInput } from './input.js';

var canvas = document.getElementById('game');
var ctx = initRenderer(canvas);
var state = createGameState();
var particles = new ParticleSystem();
var animator = new CardAnimator();
var input = initInput(canvas, function() { return state; });
var scene = 'title';
var opponentPlaysLeft = 3;

function update() {
  if (scene === 'title') return;
  if (state.winner) { scene = state.winner === 'player' ? 'win' : 'lose'; return; }
  
  particles.update();
  animator.update();

  // Round timer - counts down during play phases
  if ((state.phase === PHASE.PLAY || state.phase === 'BATTLE_READY') && !state.winner) {
    state.turnTimeLeft -= 1/60;
    if (state.turnTimeLeft <= 0) {
      state.turnTimeLeft = 0;
      state.phase = 'BATTLE_START';
      state.message = 'Time up! Auto battle!';
      state.messageTimer = 40;
    }
  }
  
  if (state.turnOwner === 'opponent' && state.phase === PHASE.PLAY && !state.winner) {
    state.messageTimer = Math.max(0, (state.messageTimer || 0) - 1);
    if (state.messageTimer <= 0) {
      var oldEnergy = state.opponent.energy;
      aiPlay(state);
      if (state.opponent.energy < oldEnergy) {
        opponentPlaysLeft--;
        state.message = 'Opponent plays...';
        state.messageTimer = 20;
      } else {
        opponentPlaysLeft = 0;
      }
    }
    if (opponentPlaysLeft <= 0 || state.opponent.hand.length === 0) {
      state.phase = 'BATTLE_READY';
      state.message = 'Battle! Press SPACE';
      state.messageTimer = 999;
    }
    return;
  }

  if (state.phase === 'BATTLE_START') {
    runBattle(state);
    // Clamp HP to 0
    if (state.player.hp < 0) state.player.hp = 0;
    if (state.opponent.hp < 0) state.opponent.hp = 0;
    animator.shake(20, 8);
    for (var l = 0; l < 3; l++) {
      var lx = 270 + l * 180, ly = 290;
      particles.burst(lx, ly, '#f0c040', 15);
    }
    if (state.winner) {
      scene = state.winner === 'player' ? 'win' : 'lose';
      return;
    }
    state.phase = 'BATTLE_DONE';
    state.message = 'Battle resolved!';
    state.messageTimer = 60;
    return;
  }

  if (state.phase === 'BATTLE_DONE') {
    state.messageTimer = Math.max(0, state.messageTimer - 1);
    if (state.messageTimer <= 0) {
      if (state.winner) {
        scene = state.winner === 'player' ? 'win' : 'lose';
        return;
      }
      nextTurn(state);
      opponentPlaysLeft = 3;
    }
    return;
  }

  // Player phase: PLAY and BATTLE_READY allow card placement; SPACE/BATTLE triggers fight
  if (state.turnOwner === 'player' && (state.phase === PHASE.PLAY || state.phase === 'BATTLE_READY')) {
    state.messageTimer = Math.max(0, (state.messageTimer || 0) - 1);
    if (state.phase === PHASE.PLAY) {
      state.phase = 'BATTLE_READY';
    }
    if (state.messageTimer <= 0) {
      state.message = 'Click cards to play, then BATTLE or SPACE';
      state.messageTimer = 120;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  
  if (scene === 'title') {
    drawTitleScreen(ctx, performance.now());
    return;
  }
  
  if (scene === 'win') {
    drawWinScreen(ctx);
    return;
  }
  
  if (scene === 'lose') {
    drawLossScreen(ctx);
    return;
  }
  
  drawGameScreen(ctx, state);
  particles.draw(ctx);
  
  // Battle log display
  if (state.battleLog && state.battleLog.length > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W / 2 - 200, 240, 400, 90);
    ctx.fillStyle = '#f0c040';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BATTLE RESULTS', W / 2, 260);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    for (var i = 0; i < Math.min(state.battleLog.length, 3); i++) {
      ctx.fillText(state.battleLog[i], W / 2, 280 + i * 16);
    }
  }
}

function gameLoop(time) {
  update();
  draw();
  function applyHash() {
  var h = location.hash.replace('#', '');
  if (h === 'play') {
    scene = 'game';
    state = createGameState();
    startFirstTurn(state);
    opponentPlaysLeft = 3;
    state.player.hp = 18;
    state.opponent.hp = 15;
    state.player.energy = 2;
    state.player.energyMax = 4;
    state.opponent.lanes[0] = { name: 'Fire Mage', suit: 'flame', power: 3, cost: 2, type: 'creature' };
    state.opponent.lanes[2] = { name: 'Coral Guard', suit: 'tide', power: 1, cost: 1, type: 'creature' };
    state.player.lanes[1] = { name: 'Storm Hawk', suit: 'wind', power: 3, cost: 2, type: 'creature' };
    state.player.hand = [
      { name: 'Phoenix', suit: 'flame', power: 6, cost: 4, type: 'creature' },
      { name: 'Wave Knight', suit: 'tide', power: 3, cost: 2, type: 'creature' },
      { name: 'Boulder Toss', suit: 'stone', power: 2, cost: 1, type: 'spell' },
    ];
    state.phase = 'BATTLE_READY';
    state.message = 'Your turn - play cards or press SPACE to battle!';
    state.messageTimer = 999;
  } else if (h === 'win') {
    scene = 'win';
    state.player.hp = 12;
    state.opponent.hp = 0;
    state.turn = 7;
  } else if (h === 'loss') {
    scene = 'lose';
    state.player.hp = 0;
    state.opponent.hp = 8;
    state.turn = 9;
  }
}
applyHash();

requestAnimationFrame(function loop(time) {
  update();
  draw();
  window.__shotReady = true;
  requestAnimationFrame(loop);
});
}

// Input handling: start game
canvas.addEventListener('click', function() {
  if (scene === 'title') {
    scene = 'game';
    startFirstTurn(state);
    return;
  }
  if (scene === 'win' || scene === 'lose') {
    state = createGameState();
    scene = 'title';
    particles.clear();
    animator.reset();
    return;
  }
  // Game scene click handling is done in input.js
});

document.addEventListener('keydown', function(e) {
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    if (scene === 'title') {
      scene = 'game';
      startFirstTurn(state);
      opponentPlaysLeft = 3;
      return;
    }
    if (scene === 'win' || scene === 'lose') {
      state = createGameState();
      scene = 'title';
      particles.clear();
      animator.reset();
      return;
    }
    if (state.phase === 'BATTLE_READY') {
      state.phase = 'BATTLE_START';
    }
  }
});

// Win/Loss screens (defined here to avoid import issues)
function drawWinScreen(ctx) {
  ctx.fillStyle = '#0d1a0d';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#40e040';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VICTORY!', W / 2, 200);
  ctx.fillStyle = '#f0f0f0';
  ctx.font = '20px sans-serif';
  ctx.fillText('You defeated the opponent!', W / 2, 250);
  ctx.fillStyle = '#f0c040';
  ctx.font = '16px sans-serif';
  ctx.fillText('Your HP: ' + Math.max(0,state.player.hp) + '  |  Opponent HP: ' + Math.max(0,state.opponent.hp), W / 2, 300);
  ctx.fillText('Turns: ' + state.turn, W / 2, 330);
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 18px sans-serif';
  var pulse = 0.6 + Math.sin(performance.now() * 0.003) * 0.4;
  ctx.globalAlpha = pulse;
  ctx.fillText('Click or Press SPACE to Play Again', W / 2, H - 80);
  ctx.globalAlpha = 1;
}

function drawLossScreen(ctx) {
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e04040';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DEFEAT', W / 2, 200);
  ctx.fillStyle = '#f0f0f0';
  ctx.font = '20px sans-serif';
  ctx.fillText('The opponent overpowered you.', W / 2, 250);
  ctx.fillStyle = '#f0c040';
  ctx.font = '16px sans-serif';
  ctx.fillText('Your HP: ' + Math.max(0,state.player.hp) + '  |  Opponent HP: ' + Math.max(0,state.opponent.hp), W / 2, 300);
  ctx.fillText('Turns: ' + state.turn, W / 2, 330);
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 18px sans-serif';
  var pulse2 = 0.6 + Math.sin(performance.now() * 0.003) * 0.4;
  ctx.globalAlpha = pulse2;
  ctx.fillText('Click or Press SPACE to Try Again', W / 2, H - 80);
  ctx.globalAlpha = 1;
}

function applyHash() {
  var h = location.hash.replace('#', '');
  if (h === 'play') {
    scene = 'game';
    state = createGameState();
    startFirstTurn(state);
    opponentPlaysLeft = 3;
    state.player.hp = 18;
    state.opponent.hp = 15;
    state.player.energy = 2;
    state.player.energyMax = 4;
    state.opponent.lanes[0] = { name: 'Fire Mage', suit: 'flame', power: 3, cost: 2, type: 'creature' };
    state.opponent.lanes[2] = { name: 'Coral Guard', suit: 'tide', power: 1, cost: 1, type: 'creature' };
    state.player.lanes[1] = { name: 'Storm Hawk', suit: 'wind', power: 3, cost: 2, type: 'creature' };
    state.player.hand = [
      { name: 'Phoenix', suit: 'flame', power: 6, cost: 4, type: 'creature' },
      { name: 'Wave Knight', suit: 'tide', power: 3, cost: 2, type: 'creature' },
      { name: 'Boulder Toss', suit: 'stone', power: 2, cost: 1, type: 'spell' },
    ];
    state.phase = 'BATTLE_READY';
    state.message = 'Your turn - play cards or press SPACE to battle!';
    state.messageTimer = 999;
  } else if (h === 'win') {
    scene = 'win';
    state.player.hp = 12;
    state.opponent.hp = 0;
    state.turn = 7;
  } else if (h === 'loss') {
    scene = 'lose';
    state.player.hp = 0;
    state.opponent.hp = 8;
    state.turn = 9;
  }
}
applyHash();

requestAnimationFrame(function loop(time) {
  update();
  draw();
  window.__shotReady = true;
  requestAnimationFrame(loop);
});