# One Cryptic

A focused, static web app that serves one original cryptic crossword clue at a time. Players can type and check an answer directly in the letter-pattern area. Definition, indicator, and fodder hints highlight their exact words in distinct colors, and another hint reveals individual answer letters. The app includes 100 bundled clues and makes no runtime API calls.

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

## AWS infrastructure

Terraform in `infra/aws` provisions a dedicated Amazon Linux 2023 `t3.micro` instance in `us-east-1`, an Elastic IP, Nginx, Systems Manager access, an encrypted 8 GB `gp3` volume, and a private encrypted S3 bucket used only to transfer release archives. The instance has no SSH ingress; public ingress is limited to HTTP on port 80. Release objects expire after seven days.

Requirements:

- Terraform 1.10 or newer
- AWS CLI v2 with an authenticated profile
- A default VPC in `us-east-1`

Review and provision:

```powershell
./scripts/provision.ps1 -AwsProfile default -PlanOnly
./scripts/provision.ps1 -AwsProfile default
```

Read the stable public URL and other infrastructure values with:

```powershell
terraform -chdir=infra/aws output
```

The initial Nginx page and `/health` endpoint verify the infrastructure independently of the application. Terraform state is local and ignored by Git; keep a private copy because it is required to manage or destroy these resources safely.

Build, verify, and deploy the static application with:

```powershell
./scripts/deploy.ps1 -AwsProfile default
```

The deployment script runs linting, type checking, clue validation, unit tests, and the production build before packaging `dist`. It uploads the package temporarily to the private release bucket, verifies its SHA-256 digest on EC2, activates it through Systems Manager, checks the public page and JavaScript bundle, then deletes the S3 object and local package. No application build tools or runtime are installed on the server.

## How progress works

The browser stores a versioned shuffled clue order, the current clue, and revealed hints in `localStorage`. Every clue appears once per cycle. After all 100 have been seen, a new shuffle starts without immediately repeating the previous clue. Clearing site data starts over.

## Current testing lock

The app is temporarily locked to one practice clue so development and testing do not reveal the rest of the library. `src/config.ts` contains the single `FIXED_CLUE_ID` switch. Set it to `null` to restore the normal randomized, non-repeating deck.

## Repository notes

The original build brief remains in [`IMPLEMENTATION_PROMPT.md`](./IMPLEMENTATION_PROMPT.md). Clues live in `src/data/clues.ts`; the production app has no AI, backend, database, account system, or secrets.
