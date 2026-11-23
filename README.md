[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/putrifransiska/rune-arena-card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/putrifransiska/rune-arena-card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Rune Arena

A tactical lane-based card duel game built by an AI agent for [make.fun](https://make.fun/bounty/best-card-game-20261122-1826)'s "Make the best card game" bounty, $50 in USDC.

## Play

```sh
node serve.ts
```

Open http://localhost:8080 in a desktop browser.

## How to play

- **Goal**: Reduce the opponent's HP to 0 before yours reaches 0.
- **Cards**: 4 suits (Flame, Tide, Stone, Wind) with an advantage cycle: Flame > Wind > Stone > Tide > Flame. Advantage gives +2 power in combat.
- **Turn**: You and the opponent draw cards, spend energy to place cards into 3 lanes, then battle resolves lane by lane.
- **Controls**: Click a card in your hand to select it, click an empty lane to place it. Press **SPACE** or click **BATTLE** to resolve combat. A 45s round timer auto-battles if it runs out.

## Project layout

- `game/` — static playable game (no build step, no network requests)
- `screenshots/` — 4 real renders (title, gameplay, win, loss)
- `main.ts` — make.fun hand-in program
- `vendor/makefun-game.ts` — make.fun dossier library (unchanged)
- `serve.ts` — local static server

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
