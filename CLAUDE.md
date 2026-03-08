# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build (also runs TypeScript checks)
- `npm run lint` — ESLint (flat config with next/core-web-vitals + next/typescript)
- `npm start` — serve production build

## Tech Stack

- **Next.js 16** (App Router) with TypeScript (strict mode)
- **Tailwind CSS v4** (using `@import "tailwindcss"` syntax, not v3 `@tailwind` directives)
- **React 19** — all components use `"use client"` since the app is fully client-side
- **No backend** — no API routes, no database, no server actions
- Path alias: `@/*` maps to `./src/*`

## Game Domain

Continental is a card game played in rounds. Players accumulate points (positive = bad, negative = good). Each round has one winner who receives an increasing discount: round 1 = -20, round 2 = -30, round 3 = -40, etc. (formula: `-(roundNumber + 1) * 10`). Non-winners get positive points that are always multiples of 5. The real game has 9 rounds but the app supports unlimited rounds. Lowest total score wins.

## Architecture

### State Management — Single source of truth

All app state flows through one `useReducer` in `src/context/GameContext.tsx`. The `GameProvider` wraps the entire app in `src/app/layout.tsx`. Access state anywhere via the `useGame()` hook.

**Reducer actions:** `ADD_PLAYER`, `REMOVE_PLAYER`, `START_GAME`, `OPEN_POINT_ENTRY`, `SUBMIT_ROUND`, `CANCEL_ENTRY`, `RESET_GAME`, `HYDRATE`

**localStorage persistence:** State auto-saves to key `contipoints-game` on every change. On mount, a `HYDRATE` action restores the previous session. The `hydrated` boolean flag gates rendering to prevent SSR/hydration mismatches.

**Player IDs:** Simple incrementing integers (as strings). A module-level `nextId` counter is synced to the max existing ID on hydration to avoid collisions.

### Page Flow

```
/  (registration)  ──Start Game──>  /game (table view)
                                       │
                                   End Round
                                       │
                                       v
                                    /game (point entry view)
                                       │
                                    Submit
                                       │
                                       v
                                    /game (table view, next round)
```

- Navigation between `/` and `/game` uses `router.push()`/`router.replace()`
- Table vs. Point Entry on `/game` is toggled via `state.currentView` (not URL routing) — avoids back-button confusion
- Both pages auto-redirect if state doesn't match expectations (e.g., `/game` redirects to `/` if no game started)

### Key Files

| File | Purpose |
|------|---------|
| `src/types/game.ts` | All TypeScript types: `Player`, `RoundResult`, `GameState`, `GameAction` |
| `src/context/GameContext.tsx` | Reducer, Context, Provider, `useGame()` hook, localStorage sync |
| `src/lib/scoring.ts` | Pure functions: `getWinnerDiscount()`, `calculateTotals()`, `isValidScore()` |
| `src/lib/storage.ts` | localStorage helpers with `typeof window` SSR guard |
| `src/components/PlayerForm.tsx` | Registration: add/remove players, start game |
| `src/components/ScoreTable.tsx` | Score table with per-round rows, current round placeholder, totals row |
| `src/components/PointEntryForm.tsx` | Score input per player, winner selection (disables input + auto-fills discount) |
| `src/app/page.tsx` | Registration page, redirects to `/game` if game already started |
| `src/app/game/page.tsx` | Game page, conditionally renders ScoreTable or PointEntryForm |

### Conventions

- All page and component files use `"use client"` — there are no Server Components in practice
- Scores in `RoundResult.scores` store the final value per player (winner's score is already the negative discount, not raw input)
- Current round number is always derived as `state.rounds.length + 1` — never stored separately
- Validation on point entry: exactly one winner required, all non-winner scores must be non-negative multiples of 5
- UI is mobile-first: `inputMode="numeric"` for phone keypads, `text-base` inputs to prevent iOS zoom, `overflow-x-auto` on the score table, sticky left column for round numbers
- Dark mode supported via Tailwind's `dark:` variants and CSS `prefers-color-scheme`
- Reset game requires `window.confirm()` before clearing
