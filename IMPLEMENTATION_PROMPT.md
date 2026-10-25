# Minute Cryptic: Implementation Prompt

## Role

Act as the senior engineer responsible for delivering this application end to end. Work directly in `D:\repos\MinuteCryptic`. Inspect the repository before changing it, preserve existing user work, implement the complete product, run the relevant checks, and leave clear run and deployment instructions.

Do not stop after scaffolding or return only a plan. Make reasonable implementation decisions within this specification and deliver a working, tested application. Ask the user only if a genuinely blocking choice cannot be resolved from this document.

## Product objective

Build a small, polished personal web app for solving randomly selected cryptic crossword clues.

The clue library is generated and reviewed during development, then committed to the repository as static data. The deployed application must not call an AI model or any external service. It must require no API key, backend, database, login, or paid runtime dependency.

This is inspired by the concise, one-clue-at-a-time experience of Minute Cryptic, but it must use an original design and original clues. Do not copy its branding, text, visual design, or published clues.

## Required experience

### Initial state

- Present a focused landing state with a prominent `Get a clue` button.
- Explain in one short sentence that the user can reveal hints when needed.
- Do not display a clue until the user presses the button.

### Active clue

After the button is pressed, display one random clue and its enumeration. Provide these controls:

- `Indicators`: reveal the indicator word or phrase, briefly state what it signals, and highlight its exact text in the clue with the indicator color.
- `Show definition`: highlight the exact definition portion of the clue with the definition color. Highlight both portions for a double definition and the whole clue for a cryptic definition.
- `Fodder`: reveal the source letters or word components used by the wordplay and highlight their exact surface text in the clue with the fodder color.
- `Wordplay`: reveal a helpful parse of the construction without directly printing the solution.
- `Reveal a letter`: reveal one additional, previously hidden solution letter on each press. Preserve spaces, punctuation, and word boundaries. Disable the control when all letters are visible.
- `Reveal answer`: reveal the complete answer, definition, and full parsing.
- `Another clue`: choose a new clue and reset all revealed hints and letters.

Each hint is independently revealable. Revealing one hint must not automatically expose the others or the answer.

For clue types that legitimately have no explicit indicator or fodder, display a useful explanation such as `This clue type has no explicit indicator` rather than inventing one.

### Randomization and persistence

- Do not repeat a clue until every clue in the library has been shown.
- Persist the shuffled clue order and current position in `localStorage` so refreshes and browser restarts do not restart the sequence.
- After the complete library has been shown, reshuffle it and begin a new cycle.
- Avoid showing the final clue of one cycle as the first clue of the next cycle when the library has more than one clue.
- Version the persisted state so future clue-library changes can safely reset an incompatible sequence.
- A page refresh should restore the current clue and its revealed state when possible.

## Explicit non-goals

Do not add:

- Runtime AI or OpenAI API calls
- API keys or environment variables
- A server or serverless API route
- A database
- Accounts or authentication
- A timer, leaderboard, streak, score, analytics, advertising, or social features
- A text box for submitting guesses
- An admin interface or clue editor
- Dependencies that are unnecessary for this small static app

## Technical requirements

Use:

- Vite
- React
- TypeScript with strict type checking
- npm
- Tailwind CSS for styling
- Vitest and Testing Library for unit/component tests
- Playwright for one small end-to-end happy-path test

The project must build to a fully static `dist` directory and work on static hosting. It must not require Node.js after the production build is produced.

Prefer a small, understandable component structure over a framework-heavy architecture. Keep clue selection, persistence, answer masking, and validation logic in testable pure functions where practical.

## Clue data model

Store the clue library in a version-controlled JSON or TypeScript data file. Use a typed schema that captures at least:

```ts
type CrypticClue = {
  id: string;
  clue: string;
  answer: string;
  enumeration: string;
  type:
    | "anagram"
    | "charade"
    | "container"
    | "deletion"
    | "reversal"
    | "hidden-word"
    | "double-definition"
    | "homophone"
    | "cryptic-definition"
    | "mixed";
  definition: string;
  definitionParts: string[];
  indicators: Array<{
    text: string;
    explanation: string;
    clueParts: string[];
  }>;
  fodder: Array<{
    text: string;
    explanation: string;
    clueParts: string[];
  }>;
  wordplayHint: string;
  fullParse: string;
};
```

The exact storage format may be adjusted if it materially improves correctness, but keep the same semantic information. The UI must never infer hints from clue prose; it should render the curated structured fields.

## Clue library

Create at least 100 original, human-solvable cryptic clues. Target approachable-to-moderate difficulty and a balanced mix of standard clue mechanisms. Favor familiar answer words and natural surface readings.

Every clue must satisfy all of the following:

- It has a fair, identifiable definition.
- Its answer matches the enumeration after ignoring spaces, hyphens, and punctuation appropriately.
- Every letter operation is accurate.
- Anagram fodder has exactly the same letter multiset as the answer or the explicitly parsed answer segment.
- Hidden answers appear contiguously in the stated fodder, allowing reversal only when explicitly indicated.
- Containers, deletions, reversals, charades, and homophones have complete and accurate parses.
- Indicator explanations identify their actual grammatical function.
- The surface reads naturally enough to resemble a sentence or phrase.
- The wordplay hint helps without directly stating the answer.
- The full parse accounts for the entire answer.
- The clue is original and is not copied or lightly paraphrased from a published puzzle.
- The clue does not depend on live news, private information, or highly obscure specialist knowledge.

Use a reasonable distribution across clue types. Do not inflate the count with low-quality near-duplicates. If producing 100 reliably correct clues in one pass is not possible, prioritize correctness, perform additional review passes, and continue until the acceptance threshold is met.

## Automated clue validation

Add a repository script such as `npm run validate:clues` that fails with actionable messages when it finds structural errors. It must check at least:

- Unique, non-empty IDs
- Non-empty required fields
- Allowed clue types
- Valid enumeration syntax
- Answer length and word grouping agree with the enumeration
- No duplicate clue text
- No duplicate normalized answers
- Indicator and fodder entries have non-empty text and explanations
- The wordplay hint does not contain the normalized full answer as a standalone answer reveal

Add stronger type-specific validation where it can be implemented reliably, especially exact whole-answer anagrams and hidden words. Do not pretend a heuristic proves editorial correctness; document what still requires human review.

## Visual direction

Create an original, restrained puzzle aesthetic: warm paper-like background, strong typographic hierarchy, crisp dark text, and one confident accent color. It should feel considered and pleasant rather than like a generic dashboard.

- Optimize the primary experience for a phone-sized screen while also looking intentional on desktop.
- Keep the clue card and main actions visually dominant.
- Use an expressive, readable serif for clue content and a complementary sans-serif for controls. Avoid default-looking system-only typography.
- Make revealed hint sections easy to scan.
- Include subtle, purposeful transitions that respect `prefers-reduced-motion`.
- Do not use copyrighted imagery or require remote image assets.

## Accessibility

- Use semantic HTML and real buttons.
- Make the full experience keyboard accessible.
- Provide visible focus styles.
- Maintain readable contrast.
- Use appropriate live-region behavior for newly revealed hints without causing excessive announcements.
- Do not communicate state using color alone.
- Give buttons accurate disabled and expanded states.

## Tests and quality checks

At minimum, test:

- Enumeration parsing and normalized answer length
- Letter-mask behavior for single- and multi-word answers
- Repeated `Reveal a letter` actions never hide or duplicate a revealed position
- No-repeat shuffle behavior across a complete cycle
- Cycle rollover does not immediately repeat the previous clue
- Persistence serialization, restoration, and version mismatch handling
- Hint controls reveal only their associated content
- `Another clue` resets hint and answer state
- One Playwright flow from `Get a clue` through hints, a letter reveal, answer reveal, and another clue

Run and pass:

```text
npm run lint
npm run typecheck
npm run validate:clues
npm test
npm run build
npm run test:e2e
```

If tooling uses slightly different script names, provide equivalent scripts and document them.

## Repository deliverables

The finished repository must contain:

- The complete application source
- The static clue library
- Automated clue validation
- Unit/component and end-to-end tests
- This `IMPLEMENTATION_PROMPT.md` file, preserved in the repository
- A concise `README.md` covering prerequisites, local development, all checks, production build, and static deployment
- A suitable `.gitignore`
- No secrets, generated dependency directories, test artifacts, or production build output committed unless there is a specific hosting reason documented in the README

## Git expectations

- Work only in `D:\repos\MinuteCryptic`.
- Inspect Git status before editing and never discard unrelated user changes.
- If the folder is not a Git repository, initialize it with `main` as the initial branch.
- Keep the implementation in a reviewable state and summarize the files and tests changed.
- Do not invent a remote URL or push to an unknown remote.
- If a remote already exists and the user has authorized a push, push the completed, tested work. Otherwise, report that a remote URL is still required.

## Acceptance criteria

The task is complete only when:

1. `npm install` followed by `npm run dev` launches the app locally.
2. The initial button produces a random clue from the bundled data.
3. All five requested hint mechanisms work correctly and independently.
4. Answer reveal and full parsing work.
5. Clues do not repeat until the library is exhausted, including across refreshes.
6. At least 100 original validated clues ship with the app.
7. The application makes no network request for clue generation and needs no runtime secret.
8. The validation, test, type-check, lint, and production build commands pass.
9. The production output is a static site suitable for static hosting.
10. The repository documentation is sufficient for another person to run and deploy it without additional explanation.

At completion, provide a concise report containing what was implemented, the verification commands and results, any limitations of automated clue validation, and whether Git still needs a remote before the project can be pushed.
