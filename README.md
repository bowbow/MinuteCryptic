# One Cryptic

A focused, static web app that serves one original cryptic crossword clue at a time. Definition, indicator, and fodder hints highlight their exact words in distinct colors, and another hint reveals individual answer letters. The app includes 100 bundled clues and makes no runtime API calls.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). No environment variables or API keys are required.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run validate:clues
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`validate:clues` checks the clue schema, IDs, duplicate clues and answers, enumeration grouping, hidden answers, and exact whole-answer anagrams. It cannot prove editorial qualities such as natural surfaces, synonym fairness, pronunciation, or every multi-step parse; those still require human review.

## Production build and deployment

```powershell
npm run build
```

The output is a fully static `dist` directory. Upload its contents to any static host, including GitHub Pages, Netlify, Cloudflare Pages, or Vercel. Configure the host's build command as `npm run build` and output directory as `dist`.

For GitHub Pages, serve the built site at the domain root or set Vite's `base` option if deploying beneath a repository subpath.

## How progress works

The browser stores a versioned shuffled clue order, the current clue, and revealed hints in `localStorage`. Every clue appears once per cycle. After all 100 have been seen, a new shuffle starts without immediately repeating the previous clue. Clearing site data starts over.

## Current testing lock

The app is temporarily locked to one practice clue so development and testing do not reveal the rest of the library. `src/config.ts` contains the single `FIXED_CLUE_ID` switch. Set it to `null` to restore the normal randomized, non-repeating deck.

## Repository notes

The original build brief remains in [`IMPLEMENTATION_PROMPT.md`](./IMPLEMENTATION_PROMPT.md). Clues live in `src/data/clues.ts`; the production app has no AI, backend, database, account system, or secrets.
