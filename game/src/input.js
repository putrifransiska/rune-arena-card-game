// Rune Arena - input handling for mouse and keyboard

export function initInput(canvas, getState) {
  var mx = 0, my = 0;

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    mx = (e.clientX - rect.left) * scaleX;
    my = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener('click', function(e) {
    var state = getState();
    if (state.winner) {
      state.winner = null;
      return;
    }
    if (state.turnOwner !== 'player') return;
    if (state.phase === 'BATTLE_READY' || state.phase === 'PLAY') {
      handlePlayClick(state, mx, my);
      handleUIClick(state, mx, my);
      return;
    }
  });

  canvas.addEventListener('mousedown', function(e) {
    // Track for potential drag
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      var state = getState();
      if (state.winner) {
        state.winner = null;
        return;
      }
      if (state.phase === 'BATTLE_READY') {
        state.phase = 'BATTLE_START';
      }
    }
  });

  function handlePlayClick(state, mx, my) {
    var handCount = state.player.hand.length;
    if (handCount === 0) return;

    var totalW = handCount * 100 + (handCount - 1) * 10;
    var startX = 480 - totalW / 2;
    var handY = 490;

    // Check hand cards
    for (var i = 0; i < handCount; i++) {
      var cx = startX + i * 110;
      if (mx >= cx && mx <= cx + 100 && my >= handY && my <= handY + 140) {
        if (state.selectedCard === i) {
          state.selectedCard = null;
        } else {
          state.selectedCard = i;
        }
        return;
      }
    }

    // If a card is selected, check lanes
    if (state.selectedCard !== null) {
      var card = state.player.hand[state.selectedCard];
      if (!card) return;
      for (var l = 0; l < 3; l++) {
        var lx = 220 + l * 180;
        var ly = 330;
        if (mx >= lx && mx <= lx + 100 && my >= ly && my <= ly + 140) {
          if (state.player.lanes[l] !== null) {
            state.message = 'Lane occupied! Pick an empty lane.';
            state.messageTimer = 50;
            return;
          }
          if (card.cost > state.player.energy) {
            state.message = 'Not enough energy! (' + card.cost + ' needed, ' + state.player.energy + ' left)';
            state.messageTimer = 60;
            return;
          }
          state.player.energy -= card.cost;
          state.player.lanes[l] = card;
          state.player.hand.splice(state.selectedCard, 1);
          state.selectedCard = null;
          state.message = 'Card played! Select another or press BATTLE.';
          state.messageTimer = 60;
          return;
        }
      }
    }
  }

  function handleUIClick(state, mx, my) {
    // Battle button
    if (mx >= 780 && mx <= 920 && my >= 380 && my <= 425) {
      if (state.phase === 'PLAY' || state.phase === 'BATTLE_READY') {
        state.phase = 'BATTLE_START';
      }
    }
  }

  function getMouse() {
    return { x: mx, y: my };
  }

  return { getMouse: getMouse };
}