# GDG AAUP - AI OR REAL

A GDG AAUP browser game: enter your name, find the AI image in five matching
picture pairs, and compare your best score and time on a browser-local leaderboard.
Built with Vite, vanilla JavaScript ES modules, HTML, and CSS. One HTML entry uses
in-app views, so server-side route rewrites are not needed.

Milestones 1-7 are complete; Milestone 8 deployment is being verified. The supplied
GDG branding and existing white-grid, Google-color design are preserved.

Repository: [mariam05050/gdg-game-aaup-ai-or-real](https://github.com/mariam05050/gdg-game-aaup-ai-or-real)

Pages target (deployment verification pending):
[AI OR REAL](https://mariam05050.github.io/gdg-game-aaup-ai-or-real/)

## Local setup

Open the existing `ai-or-real` folder. Run commands from that root, alongside
`package.json`, rather than from `public/` or `docs/`.

Use Node.js `^20.19.0 || >=22.12.0`, as required by the installed Vite version.
The verified environment uses Node.js 24.16.0 and npm 11.13.0.
Use that verified Node environment for the complete browser-check harness.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`).
Stop the server with Ctrl+C. On systems without Windows command shims, use
`npm` in place of `npm.cmd`.

If Windows reports EPERM on a Vite/Rolldown native binding during `npm.cmd ci`,
stop this project's running dev/preview server, retry the install, then restart
the server. Do not delete or replace the supplied images to fix a setup error.

## Checks and production build

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`test` runs deterministic round/preparation, name, and storage/ranking tests plus
the asset audit, available separately as
`npm.cmd run verify:assets`. It verifies exactly 15 unique pair IDs, 30 distinct
paths, exact filenames and case, the real/AI filename convention, file headers,
and no unpaired picture files. It does not prove image provenance or perform
full browser decoding. See `docs/progress.md` for checks actually performed.

The build writes to `dist/`; preview serves that build at the printed local URL
(normally `http://localhost:4173/`). Keep `package-lock.json` in source control
for reproducible installs. `node_modules/`, `dist/`, and temporary audit outputs
are ignored. Preview is a local build check, not deployment.

## Assets and instructions

- `public/assets/branding/logo.png`: supplied logo, preserved unchanged.
- `public/assets/pictures/`: 30 supplied WebP pictures, preserved unchanged.
- `src/data/pairs.js`: 15 stable records with `id`, `real`, and `ai`.
- `src/assets.js`: resolves public-relative paths against Vite's `BASE_URL`.
- `docs/GDG-AAUP-AI-or-Real-Plan.md`: authoritative specification.
- `docs/GDG-AAUP-AI-or-Real-Codex-Prompts.md`: milestone instructions.
- `docs/progress.md`: pairing table, validation results, blockers, next milestone.

Keep pair paths such as `assets/pictures/beach.webp` relative, with exact file
extensions and letter case. Browser URLs must not contain `public/`. Use
`assetUrl(pair.real)` or `assetUrl(pair.ai)` when displaying pairs.
The logo uses the same resolver; the favicon uses `%BASE_URL%`.
`vite.config.js` uses `/` for local development and `/gdg-game-aaup-ai-or-real/`
for production build/preview. Do not rename or replace supplied assets to resolve
an ambiguous match without checking with Mariam.

For image maintenance:

1. Inspect both pictures and confirm their matching subject and supplied real/AI
   identification. Ask Mariam about missing or ambiguous files; do not guess.
2. Preserve original names, extensions, and case. AI files currently use `_AI.webp`.
   Keep branding separate from the picture pool.
3. Keep exactly 15 stable pair IDs and 30 distinct file references in
   `src/data/pairs.js`. Each record has `id`, `real`, and `ai`, with paths relative
   to `public/`, for example `assets/pictures/beach.webp` (no leading slash).
4. Use `assetUrl()` for runtime image URLs. Do not display revealing filenames,
   types, or accessible names before selection.
5. Run `npm.cmd test`, `npm.cmd run build`, and `npm.cmd run test:subpath` after an
   approved asset change. The browser suite decodes all 30 pictures and the logo;
   the exact filename audit is also recorded in `docs/progress.md`.

The landing includes a white grid, subtle CSS-only floating decorations, keyboard
focus styles, reduced-motion support, and a labeled name field. Name entry cleans
whitespace on blur or submission and enforces 30 Unicode code points after NFC
normalization, preserving case and supporting Unicode names. Name entry alone
does not save a result.

## Current round behavior

Each round selects five distinct pairs from the 15-pair pool with Fisher-Yates
shuffle. AI left/right position is randomized independently for every question.
Pairs may reappear in later rounds. A correct choice earns one point; a wrong
choice earns zero, with no deduction. There are no extra modes or AI API calls.

The landing prepares five unique pairs from the verified pool and decodes all ten
images. Start becomes available after preparation and valid name entry. If images
fail, use Retry after checking the connection. The same selected files are retried.

Choose Image A or Image B once per question. The first answer locks both cards;
only an AI choice adds a point. Click Next after each of the first four answers.
The clock includes feedback, reading, and Next delays, using elapsed timestamps
rather than callback counts. Answer five freezes time and creates one in-memory
completed attempt, which is saved immediately if it beats this name's saved best.
This happens before View Results. Refresh abandons an unfinished round without
saving it; a completed fifth answer is already persisted when storage succeeds.
There is no pause, countdown, or time limit. Time displays as `mm:ss.hh`, with
minutes allowed above 59; ranking uses full-precision milliseconds.

Correct choices show a green glow and `YAY! YOU FOUND THE AI!`; incorrect choices
show a red glow and `Oops! This one is a real image.` Both image types are revealed
after answering. Next is hidden until an answer is accepted. After answer five,
View Results opens the already-frozen score/time without changing the attempt.

Results show the player's name, score out of five, and final time. Play Again
returns to the same landing design, retains the name, prepares a new five-pair
round, and waits for an explicit Start. Home returns there with a cleared name.
Leaderboard opens from the landing or results and returns to that same view with
Back. Results report a new personal best, the existing saved best, or an honest
save error. The attempt's displayed score/time always describes the current round.

## Local leaderboard

Scores use this game's key, `gdg-aaup:ai-or-real:leaderboard:v1`, containing
versioned JSON (`version: 1`, `entries`). Each entry has normalized `nameKey`,
cleaned `displayName`, integer `score`, unrounded `elapsedMs`, `savedAt` timestamp,
and the completed `roundId` for duplicate protection.

Matching uses Unicode NFC normalization, trimmed edges, collapsed whitespace,
and lowercase. For example, ` Mariam ` and `mariam` share one entry. Names are
labels, not verified accounts; people sharing a name should add an initial.
Only a higher score, or a faster equal score, replaces a saved best. Equal and
worse attempts preserve the previous entry and its timestamp.

Rows sort by score descending and elapsed milliseconds ascending. Exact ties
share competition ranks (`1, 2, 2, 4`); timestamps and normalized names order tied
rows without changing their rank. Ranks 1 through 5 are highlighted, including
all fifth-place ties. All remaining rows stay visible. From results, the current
player's saved row is marked **You**, even if this attempt did not beat it.

In **Organizer controls**, **Clear Leaderboard** asks **Clear all saved scores on
this browser?** Cancel preserves scores. Clear removes only this game's key.
Read/parse/write/removal failures are reported without claiming success, and
gameplay stays usable. Invalid saved data is preserved until intentionally cleared.

Scores belong to one browser profile and origin (scheme, hostname, and port).
They are not tied to a GitHub account. Devices, browsers, or different localhost
ports can hold separate lists. Moving to GitHub Pages does not transfer local
scores or create a shared online leaderboard. Repository paths on the same host
share an origin, so this game uses its own key. Normal redeployments at the same
origin retain scores when the key stays stable. Use one event device/browser for
a common event list. Clear test scores only through an intentional organizer action.

## Browser flow checks

After building, run the optional noninteractive integration check with an installed
Chrome or Edge:

```powershell
npm.cmd run build
npm.cmd run test:browser
```

This starts and stops its own local production preview and headless browser,
checks multiple full rounds (DOM clicks, native mouse/touch, and Space/Enter), feedback,
frozen results, replay, Home, stale events, immediate saving, same-name best
preservation, tied ranks, refresh persistence, clear/cancel, storage failures,
safe text rendering, image-loading failure/Retry, reduced motion, focus, double-click/
double-tap Start, bounded listeners/clock loops, and laptop/phone layouts. Screenshots
and the isolated browser profile go into ignored `.tmp/`. No extra npm dependencies
are required. Set `BROWSER_PATH` if the browser executable is installed elsewhere;
`BROWSER_DEBUG_PORT` can override the default debugging port 9225.

## Repository-subpath compatibility check

```powershell
npm.cmd run test:subpath
```

This builds with the representative base `/milestone-7-check/` into ignored
`.tmp/subpath-dist/`, starts a local preview at that base, and runs the full browser
suite there. It verifies all pictures/logo, favicon, JavaScript/CSS URLs and MIME
types, game flow, responsive controls, and local leaderboard. It stops the preview
and browser afterward and leaves the ordinary `dist/` build and `vite.config.js`
default base unchanged. It does not assume a real GitHub repository name or publish.

For an interactive check after that command:

```powershell
npm.cmd run preview -- --base=/milestone-7-check/ --outDir=.tmp/subpath-dist
```

Open the printed local origin plus `/milestone-7-check/`. Stop with Ctrl+C.
Normal `npm.cmd run preview` serves `/gdg-game-aaup-ai-or-real/` from `dist/`.

## Source and local-only files

Keep source, `public/` assets, `docs/`, tests, scripts, `index.html`, Vite config,
package files, and `.gitignore` under version control when a repository is chosen.
`node_modules/`, `dist/`, `.tmp/`, temporary files, environment secrets, local
credential files, and optional root `local-data/`, `player-data/`, `score-exports/`,
and `leaderboard*.json` exports are excluded by `.gitignore`. The application
itself writes player data only to localStorage, not to project files. The isolated
test browser stores its profile under ignored `.tmp/`.

## Release status and remaining checks

Milestone 6's full interaction regression and Milestone 7's local cleanup/subpath
checks are complete, preserving the existing UI. See `docs/progress.md` for actual
commands, results, local acceptance checklist, and outstanding event-device checks.
Physical-phone keyboard/scrolling, assistive technology, actual storage/privacy
settings, and background-tab behavior on the event device still need manual review.

The confirmed public repository is `mariam05050/gdg-game-aaup-ai-or-real`, on `main`.
It was verified empty before connecting this existing folder. Pages is configured
to use GitHub Actions. `.github/workflows/deploy.yml` runs on pushes to `main` or
manual dispatch: Node 24, `npm ci`, `npm test`, `npm run build`, then upload/deploy
the generated `dist/` artifact. `docs/` remains documentation, not the publishing
source. The workflow uses official actions with release versions verified against
their repositories on 2026-10-23, following the
[Vite deployment guide](https://vite.dev/guide/static-deploy.html) and
[GitHub Pages workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Deployment commit, workflow run, and hosted verification results will be recorded
here and in `docs/progress.md` once GitHub reports a successful deployment.

The browser suite can also check the hosted game using `TEST_SITE_URL` set to the
confirmed HTTPS Pages URL. It creates a separate Chrome profile under ignored
`.tmp/`, requires empty localStorage before using fixtures, and never uses your
normal browser/event profile. Do not run storage-clearing tests in an event profile.
