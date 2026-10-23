# Project progress

## Current status: Milestone 8 deployed and verified (2026-10-23)

Read the full plan, companion prompts, and progress history. User explicitly
authorized publishing to the verified public target:
https://github.com/mariam05050/gdg-game-aaup-ai-or-real . GitHub's successful
deployment reports the actual live website:
https://mariam05050.github.io/gdg-game-aaup-ai-or-real/ . Hosted verification
below used this public HTTPS address, not a local preview or predicted URL.

- Git 2.49.0.windows.1 and Git Credential Manager 2.6.1 are installed; GitHub CLI
  is absent. Used the saved credential only in memory, verified authenticated login
  `mariam05050` and admin/push permissions. No credentials were written to source.
- GitHub API confirmed public visibility, default branch `main`, empty branch list,
  and zero repository size; `git ls-remote` returned no refs. No unrelated content
  or history exists to overwrite. Initialized this existing folder on `main` and
  set origin to the confirmed HTTPS repository URL. No nested project was created.
- Pages API already reports `build_type: workflow`, HTTPS enabled, and the expected
  URL. No Pages setting change was necessary.
- Production build/preview now use `/gdg-game-aaup-ai-or-real/`; development keeps
  `/`. Updated the existing browser suite to read the build base and optionally
  test the hosted URL in its own isolated profile, requiring empty localStorage
  before fixtures. Real event browser data is never used by these tests.
- Created `.github/workflows/deploy.yml`, following current official Vite/GitHub
  guidance and API-verified releases: checkout v7.0.1, setup-node v7.1.0,
  configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1.
  Workflow includes main push/manual dispatch, Node 24, npm ci/test/build,
  contents/read + pages/write + id-token/write permissions, Pages concurrency,
  separate build/deploy jobs, needs dependency, github-pages environment and URL.
- Git ignore checks confirm node_modules, dist, .tmp, environment secrets and local
  player-data paths are excluded. No dependency reinstall or cleanup was performed.
- `npm.cmd test`: passed, exit 0; 29 tests plus all 15 pairs/30 pictures and logo.
- `npm.cmd run build`: passed, exit 0; 16 modules in 384 ms; HTML 0.62 kB,
  CSS 14.43 kB (gzip 4.08), JS 23.04 kB (gzip 7.78).
- Production browser regression at the actual repository subpath passed: all 31
  image decodes and favicon/JS/CSS MIME checks, full five-question games, timer,
  locking/feedback/manual Next/results/replay/Home, persistence/ranking/clear/cancel,
  storage failures, Retry, mouse/touch/keyboard, layouts, reduced motion, and bounded
  loops/listeners. Hosted mode is checked again after deployment.

### Actual publication evidence and final checks

- Committed and pushed 63 reviewed project files to `origin/main`, without force
  push. Initial deployed commit:
  [`f8b58aa631fe409cdea2a285fe5d3c9cf187a4b1`](https://github.com/mariam05050/gdg-game-aaup-ai-or-real/commit/f8b58aa631fe409cdea2a285fe5d3c9cf187a4b1).
- [Actions run #1](https://github.com/mariam05050/gdg-game-aaup-ai-or-real/actions/runs/39988346350)
  completed with `success`: checkout, Node setup, npm ci, tests, production build,
  Pages configuration, artifact upload and deploy all succeeded. The GitHub Pages
  deployment record `7283563533` reports `success` for that SHA and the actual live
  URL above, at 2026-10-23 16:38:05 UTC.
- Final `npm.cmd run test:browser` against local production preview: passed,
  exit 0, including the full fault suite, native mouse/touch/keyboard, responsive
  layouts, reduced motion, and final refresh abandonment. Both `/` and the logo
  returned HTTP 200 through a separately started/closed local dev server.
- Hosted runs passed all 31 image decodes and favicon/JavaScript/CSS path/MIME
  checks, pointer and keyboard rounds, native mouse/touch rounds, feedback,
  answer/Next locking, continuous time, fifth-answer freeze, matching results,
  replay/Home, leaderboard persistence after refresh, ties, safe text names,
  clear/cancel, and storage-error handling. These used isolated profiles, never
  the normal browser or event scores.
- The full hosted fault-injection suite did not finish: repeated forced cold
  downloads sometimes exceeded the unchanged 15-second image-preparation guard.
  Diagnostics showed HTTP 200 downloads taking about 20 seconds and the correct
  loading-error/Retry UI, with Start still disabled. Two retries were insufficient
  in some stress runs. This is recorded as a remote-network verification limit,
  not reported as a passing full hosted regression.
- Browser-harness fixes only: allow longer hosted waits with diagnostic page state,
  exercise visible Retry without substituting files or bypassing readiness, restore
  normal caching after the intentional missing-image simulation, and verify refresh
  abandonment immediately rather than requiring unrelated new image preparation.
  The final abandonment assertion also verifies that comparison stays hidden.
- Final `node .tmp/check-hosted-smoke.mjs`: passed, exit 0, against the actual live
  site with normal caching and no network fault injection. All 30 pictures and logo
  decoded, five distinct questions produced 5/5, cards locked, feedback matched,
  time stayed frozen after answer five and through results, saving occurred before
  View Results, and the saved leaderboard survived a normal refresh. No runtime
  exceptions occurred. This isolated run never cleared any scores. The temporary
  check and its browser profile remain ignored; neither is published as source.
- SHA-256 comparison confirms every `src/` file, all 31 original public assets,
  both authoritative instruction documents, package.json and package-lock.json
  are unchanged from the start of Milestone 8. No design or game rule changed.
- Git index audit found only the intended 63 source/asset/doc/test/config files;
  no node_modules, dist, .tmp, credentials, or player data is tracked. No local
  dependencies were reinstalled and no original file was deleted.
- README now records repository/live links, initial deployed SHA and successful
  workflow, production/local paths, workflow operation, safe isolated hosted checks,
  and verification limits. This documentation/browser-harness follow-up triggers a
  subsequent main deployment; its site source and build configuration are identical
  to the initial verified deployment. Subsequent runs are listed in the repository's
  [deployment workflow history](https://github.com/mariam05050/gdg-game-aaup-ai-or-real/actions/workflows/deploy.yml).

No authentication or Pages configuration blocker remains. Review cold image
loading/Retry on the intended event connection, actual phone/keyboard/scrolling,
assistive technology, storage/privacy settings, OS reduced-motion preference, and
real background-tab behavior. Those physical-device checks remain manual; full
local/browser emulation does not replace them. Preserve real event scores.

Milestone 8 publication is complete. No unrelated features or visual changes were
introduced. The final reply identifies the follow-up deployment's confirmed SHA
and workflow after it completes, so the latest deployed revision is unambiguous.

## Requested visual follow-up complete (2026-10-23)

Completed only the two requested visual adjustments after Milestone 7. Runtime
changes are confined to `src/style.css`; no JavaScript, game rules, image assets,
dependencies, or deployment settings were changed.

- Enlarged the existing AI OR REAL title from 39px to 52px on desktop. On mobile,
  replaced 34px with `clamp(38px, 7vw, 44px)` to keep the title responsive. Its font
  family, weight, colors, letter spacing, OR circle, green dot, and other styling
  remain unchanged. GDG AAUP and the existing layout rules are unchanged.
- Increased large background dots from 13px to 16px and small dots from 6px to
  8px. Desktop opacity is now .52/.55, with mobile dots at .35; code symbols use
  .38 desktop/.28 mobile opacity. Symbol sizes and the existing Google colors
  remain unchanged. Small dots remain hidden on phones as before.
- Gently widened the existing float from 10px/-22px to 16px/-30px, with explicit
  starting transforms and the same smooth alternate easing, staggered negative
  delays, 9–20 second durations, and fixed set of 11 decorations. Motion remains
  CSS-only, noninteractive, behind content, and disabled by reduced-motion rules.
- `npm.cmd test`: passed, exit code 0; all 29 tests passed and the asset audit
  verified 15 pairs/30 WebP images plus the original PNG logo.
- `npm.cmd run build`: passed, exit code 0; 16 modules built in 327 ms. CSS
  14.43 kB (gzip 4.08 kB); JS 23.02 kB (gzip 7.77 kB).
- `npm.cmd run test:browser`: passed, exit code 0. Existing production-browser
  regression verified full rounds, feedback/locking/manual Next/frozen time,
  results/replay/Home, leaderboard persistence/clear/cancel/storage failures,
  image Retry, keyboard/mouse/touch, reduced motion, and bounded decorations/
  listeners/clock callbacks. All public images/logo decode; asset URLs still pass.
- Reviewed fresh 1440px laptop and 320px narrow-phone landing screenshots: the
  title fits without clipping, the original visual design is retained, and the
  background remains subtle. Screenshots remain in ignored `.tmp/` under the
  existing browser-check filenames. Physical-device/assistive-technology checks
  listed below remain manual; no new implementation blockers were found.

No dependencies were reinstalled and no unrelated cleanup or publishing was done.
Milestone 8 has not started.

## Current status: Milestone 7 complete (2026-10-23)

Read the authoritative plan, companion prompts, and this entire progress record
before working. First rechecked Milestone 6: all 29 deterministic tests, the asset
audit, production build, and full browser regression passed. No Milestone 6
implementation blockers remained, so release preparation proceeded. Physical-device
and assistive-technology checks remain manual as recorded below.

### Cleanup and release preparation

- Inspected the source, public assets, configs, scripts, tests, root files, and
  documentation. No unused Vite demo files remained. Removed the unused
  `is-selected` class assignment from `src/round-view.js`; the existing correct/
  incorrect classes and appearance are unchanged. No working feature, meaningful
  test, picture, logo, or instruction document was removed.
- Source hashes compared with the start of Milestone 7 confirm that only
  `src/round-view.js` changed under `src/`. Every stylesheet is byte-for-byte
  unchanged. Landing, game, feedback, results, leaderboard, grid, decorations,
  typography, colors, spacing, and animations retain the completed design.
- Expanded `.gitignore` for temporary files, environment secrets, local credential
  files, and optional local player-data exports, alongside existing exclusions for
  `node_modules/`, `dist/`, and `.tmp/`. The game writes player data only to browser
  localStorage; isolated test profiles remain in ignored `.tmp/`. No credential-like
  project files were found in the source inventory.
- Completed `README.md`: project/setup, rules, commands, image maintenance,
  leaderboard ranking/storage limitations, local-only files, representative subpath
  verification, release status, and remaining checks.
- Added `scripts/check-subpath.mjs` and `npm.cmd run test:subpath`. They build into
  ignored `.tmp/subpath-dist/` with `/milestone-7-check/`, then run the complete
  production-browser suite there. `scripts/check-round-flow.mjs` now checks all
  31 asset decodes plus script, stylesheet, favicon URLs and response MIME types.
  No actual GitHub username, repository name, or deployment base was assumed.

### Actual command and verification results

- `npm.cmd ci --offline --no-audit --no-fund`: passed, installing 15 packages in
  960 ms. An initial EPERM on the native Rolldown binding persisted with elevated
  execution because this workspace's existing Vite server held it open. After
  identifying and stopping that exact server, the clean lockfile install succeeded.
  The original dev server was restarted afterward; no unrelated process was stopped.
- `package.json` and `package-lock.json` root name, version, engines, dependencies,
  and devDependencies match. `npm.cmd ls --depth=0` reports Vite 8.3.5. No dependency
  versions were changed; the added npm script needs no lockfile dependency change.
- Final `npm.cmd test`: passed, exit code 0, all 29 deterministic tests passed.
  Asset audit passed for 15 unique pairs, 30 distinct exact-case WebP paths, and
  the original PNG logo.
- Final `npm.cmd run build`: passed, exit code 0; Vite 8.3.5 transformed 16 modules
  in 273 ms. HTML 0.55 kB, CSS 14.38 kB, JS 23.02 kB; gzip CSS 4.07 kB and JS
  7.77 kB. The ordinary `dist/` output remains available.
- `npm.cmd run dev`: started successfully in 452 ms; HTTP GET at
  `http://localhost:5173/` returned 200. Left running to restore the preexisting
  local development session.
- `npm.cmd run test:subpath`: passed, exit code 0. Representative production build
  completed in 284 ms, 16 modules. HTML 0.60 kB, CSS 14.38 kB, JS 23.04 kB.
  Browser-loaded logo/favicon/JavaScript/CSS all use `/milestone-7-check/` and
  return correct types; all 30 pictures and the logo decode successfully.
- SHA-256 comparison against the original supplied assets confirms all 31 public
  files remain unchanged. Both instruction-document hashes also match the original
  baseline. All 31 public files are copied byte-for-byte into both production builds.
- `git status --short --branch`, `git branch --show-current`, and `git remote -v`
  each reported that this folder is not a Git repository. There is no branch,
  remote, index, or staged-file audit available here. No repository was initialized;
  ignore rules are prepared for future Git use, not evidence of an existing index.

### Local acceptance checklist

- Passed full five-question rounds using DOM activation, native mouse, touch, and
  keyboard Space/Enter: five unique pairs, independent sides, neutral pre-answer
  labels, equal contained pictures, exact correct/wrong feedback, first-answer
  locking, manual Next, repeated-click protection, and final timer freeze.
- Passed continuous timing through feedback/Next waits, unchanged frozen results,
  immediate completion saving before View Results, duplicate-save protection,
  replay with explicit Start, Home name clearing, and refresh abandonment of an
  unfinished round. Game engine and deterministic timing tests remain unchanged.
- Passed leaderboard refresh persistence, normalized same-name best preservation,
  score/time replacement tests, competition ties and fifth-place highlights,
  current-player identification, clear/cancel and native Escape/focus restoration.
  Injected read, parse, write, and deletion failures remain honest and preserve play.
- Passed laptop 1440x960 and narrow phone 320x740 interaction/layout checks plus
  390x844 results coverage. Reviewed generated laptop landing and phone results
  screenshots; no redesign or visual adjustment was needed.
- Passed visible keyboard focus, unobstructed mouse/touch targets, failed-image
  loading and Retry recovery, reduced-motion emulation, background stacking and
  pointer behavior, fixed decoration counts, and bounded clock callbacks/listeners
  across repeated navigation. No runtime exceptions were recorded.
- Browser/preview processes created by integration checks closed afterward. Screenshots
  remain in ignored `.tmp/milestone-6-*.png` and existing leaderboard evidence paths;
  the final suite refreshed them using the representative production subpath.

### Remaining manual checks and next-milestone boundary

No Milestone 7 implementation blockers remain. On the intended event laptop and a
physical phone, review the mobile keyboard, touch scrolling, zoom/readability,
screen-reader announcements/focus, actual OS reduced-motion setting, real storage/
privacy configuration, and background-tab return. Automated Chrome emulation and
injected failures do not replace these checks; test Safari/Firefox if those will
be used. Clear only intentional test scores, preserving any real event results.

GitHub owner/organization, repository name, visibility, repository URL, and live
game URL remain unconfirmed. These are inputs for a separately authorized
Milestone 8, not assumed values or local-release blockers. No GitHub repository,
workflow, commit, push, deployment configuration, or publication was created or
modified. Milestone 8 has not started.

## Historical Milestone 6 completion (2026-10-23)

Read the plan, companion milestone prompts, and all previous progress records
completely. Verified the integrated game and fixed only confirmed interaction/
accessibility issues. The existing visual design is preserved.

### Confirmed fixes and changed files

- Native mouse testing reproduced a rapid double-click on Start landing its
  second click on a newly displayed image, accepting an unintended first answer.
  `src/round-view.js` now ignores continued multi-click image activation
  (`event.detail > 1`), while accepting fresh clicks, touch taps, and keyboard
  activation. No arbitrary time delay, game rule, score, or timer change was added.
  Native mouse double-click and narrow-phone double-tap regressions both pass.
- Keyboard skip links already changed destination during navigation but kept the
  landing-specific label `Skip to name entry`. The same controller now updates
  label and destination together: game, results, leaderboard, or name entry.
  The hidden link's visual styling and the normal screen designs are unchanged.
- New `scripts/check-interactions.mjs` extends the repeatable browser regression
  with trusted mouse/touch events, blocked-image recovery, name/focus checks,
  motion checks, complete rounds, repeated navigation, and listener/frame counts.
- `scripts/check-round-flow.mjs` invokes these checks and injects test-only
  instrumentation before app initialization. The instrumentation is confined to
  the isolated test browser; no profiling globals or counters were added to the app.
- `README.md` reflects the completed verification and browser command's coverage.
- This progress record includes actual outcomes and remaining device checks.

No stylesheet, typography, spacing, color, grid, logo, particle, card, feedback,
results, or leaderboard design was changed. Source hash comparison with the start
of this milestone confirmed that only `src/round-view.js` changed under `src/`.
The engine, storage/ranking service, pair records, name handling, and all existing
rules remain unchanged. No dependencies or deployment files were added.

### Actual test and build results

- `npm.cmd test`: passed, exit code 0; all 29 deterministic Node tests passed.
  The asset audit verified all 15 pairs, 30 distinct correctly cased WebP paths,
  and the PNG logo.
- `npm.cmd run build`: passed, exit code 0; Vite 8.3.5 transformed 16 modules
  and built in 262 ms. HTML 0.55 kB, CSS 14.38 kB, JS 23.03 kB;
  gzip CSS 4.07 kB and JS 7.77 kB. The CSS bundle is unchanged.
- Final `npm.cmd run test:browser`: passed, exit code 0 against its automatically
  started production preview. The isolated Chrome profile uses test scores only;
  no real event data was read or cleared. Test browser and preview closed afterward.
- Full existing regression passed: exact correct/wrong feedback, locked answers,
  manual Next, final freeze, matching results, replay with explicit Start, Home,
  current-player leaderboard, same-name lower-score preservation, shared ranks,
  fifth-place ties, refresh persistence, clear/cancel, and all injected storage
  read/parse/write/removal failure paths. Immediate save and duplicate/stale-event
  checks still confirm one completion write before View Results.
- Added trusted Chrome mouse and touch rounds, each with five unique pairs and
  alternating correct/wrong choices producing 3/5. Native Space/Enter and Tab
  continue to pass in the existing keyboard round and added focus checks.
  Both touch and mouse reached Next/results/leaderboard/replay through actual
  input events rather than only programmatic button activation.
- Native repeated Start did not overlap rounds or answer the new pair after the
  fix. Repeated Next did not skip questions. Both image cards locked on acceptance;
  the timer continued while waiting for manual Next and froze at answer five.
  Results preserved that frozen value. Refresh during a new unfinished round
  abandoned it without changing saved data or restoring an unfinished timer.
- Laptop 1440x960 and narrow mobile 320x740 checks passed, along with the existing
  390x844 results coverage. Inspected landing, comparison, wrong feedback, results,
  leaderboard, and confirmation screenshots. No confirmed overflow, clipping,
  obstruction, or image-sizing issue required visual changes. Images retain equal
  outer frames and `object-fit: contain`; the phone layout scrolls vertically.
- Browser network blocking forced image decode failures: Start stayed disabled,
  readable error and Retry appeared, and a trusted Retry click recovered once
  requests were restored. Blank names stayed invalid; repeated name whitespace
  was cleaned and a visible keyboard focus ring was checked on Start.
- Neutral card labels, empty image alt text, absence of revealing tooltips,
  type labels, filenames, and answer-specific classes were checked before each
  question. Both image types and the correct selected glow appeared only after
  acceptance. Prepared file URLs remain inspectable in source, as the plan allows.
- Reduced-motion emulation stopped all particle animation. Restoring normal
  preference restored a positive, bounded particle-animation count (at most 11).
  The background retained exactly 11 decorations, negative stacking order, and
  `pointer-events: none`; target hit tests confirmed controls were unobscured.
- Instrumented requestAnimationFrame showed exactly one pending clock callback
  during play and none on final feedback, results, leaderboard, preparation, or
  the landing. After replay/Home and five touch leaderboard/Back cycles, persistent
  Start, Leaderboard, form-submit, and input listeners remained one each. Particle
  counts stayed fixed. No duplicated animation loop or listener issue was found.
- Clear confirmation initially focused Cancel. Native Escape closed it without
  deleting scores and restored focus to Clear Leaderboard. Back navigation and
  the corrected skip-link labels matched their destinations.
- Final browser run recorded no runtime exceptions. SHA-256 comparisons confirmed
  all 31 supplied assets and both instruction documents remain unchanged.

Visual evidence is in ignored `.tmp/milestone-6-*.png`, including
`landing-laptop`, `mouse-question`, `loading-error-laptop`, `landing-narrow-phone`,
`touch-question`, `touch-wrong-feedback`, `touch-results`,
`leaderboard-narrow-phone`, and `confirmation-narrow-phone`.

### Manual checks still needed

Run `npm.cmd run dev` on the intended event laptop and a physical phone. Verify
the actual mobile keyboard, touch scrolling, zoom/readability, and screen-reader
announcements/focus through the full journey. Chrome touch emulation and computed
focus checks do not replace testing a physical phone or assistive technology.
Check the device's real reduced-motion preference, storage/privacy configuration,
and background-tab return; motion/network/storage failure checks above used browser
emulation or injected failures, and callback-free timing remains covered by the
unchanged deterministic engine tests. Review Safari/Firefox if those will be used;
this automated run used installed Chrome. Clear test scores only intentionally,
without erasing real event results.

No Milestone 6 blockers remain. **Milestone 7 - Release preparation** is next and
has not been started. No deployment preparation, GitHub workflow, publishing,
backend, sounds, modes, or unrelated features were added.

## Historical Milestone 5 completion (2026-10-23)

Read the full plan, companion prompts, and progress record before editing.
Completed only the browser-local leaderboard and its connection to existing views.

### Implementation and changed files

- `src/leaderboard.js`: stable key `gdg-aaup:ai-or-real:leaderboard:v1` and validated
  `{ version: 1, entries: [...] }` JSON. Each entry stores normalized name key,
  cleaned display name, integer score, unrounded elapsed milliseconds, saved
  timestamp, and round identity. Name matching uses NFC Unicode normalization,
  trimmed edges, collapsed whitespace, lowercase, and NFC normalization afterward.
- Only a higher score or a faster equal score replaces a saved entry. Equal and
  worse attempts keep the old entry, display name, and timestamp without writing.
  A round-identity cache prevents repeated completion processing; persisted best
  entries also retain the winning round ID. Unfinished engines have no completed
  attempt and are never passed to the storage service.
- Ranking sorts score descending, then full-precision elapsed milliseconds
  ascending. Exact ties share competition ranks; saved timestamp and normalized
  name only order tied rows. All rank-5 ties are highlighted and all rows remain
  accessible. Read/schema/parse/write/removal failures return honest messages.
  Invalid data is preserved and blocks automatic overwriting; only explicit
  confirmed clearing removes this game's data.
- `src/leaderboard-view.js` and `src/leaderboard.css`: new responsive leaderboard
  using existing GDG theme, rank/name/score/time table, current-player label, empty
  and error states, Back, organizer controls, and native clear-confirmation dialog.
  Exact confirmation: `Clear all saved scores on this browser?` Cancel makes no
  storage change; Clear calls `removeItem` for this game's key only. Names use
  `textContent`, so markup-like names render literally.
- `src/round-view.js`: saves immediately after the fifth accepted answer returns
  its immutable attempt, before feedback rendering and View Results. The existing
  engine still freezes time before storage work. Results reuse the existing status
  area for new-best/existing-best/save-error messages, and refresh that status after
  leaderboard navigation so clearing cannot leave a false saved-best claim.
- Leaderboard buttons now connect from landing/results. Back restores the previous
  non-game view and its triggering control's focus. From results, the normalized
  player's saved row is marked You, including when an older best was retained.
  Landing preparation can finish while the leaderboard is open without stealing
  focus. No navigation into the leaderboard from an active round was added.
- `src/main.js`: preparation status no longer says Leaderboard is coming soon.
  Existing landing and results controls/styles are reused; no completed screen was
  redesigned. `src/style.css`, `src/game.css`, `src/game.js`, particles, and verified
  pair records were not edited.
- `tests/leaderboard.test.js`: 14 new deterministic storage/ranking tests; existing
  15 engine/name tests and asset audit remain active.
- `scripts/check-round-flow.mjs` and new `scripts/check-leaderboard-flow.mjs`:
  browser regression, immediate-save/duplicate checks, normalized replay,
  current-player navigation, persistence, clear/cancel, tied ranks, safe names,
  and injected storage failures in an isolated profile/origin.
- `README.md`: current functionality, schema/key, ranking, error handling,
  organizer clearing, and browser/profile/origin limitations. No dependencies,
  package scripts, lockfile, or deployment configuration were changed.

### Actual verification results

- `npm.cmd test`: passed, exit code 0. All 29 Node tests passed (14 new plus 15
  existing). Asset audit passed for all 15 verified pairs, 30 distinct picture
  paths, and the supplied PNG logo.
- Tests cover higher-score replacement regardless of time, lower-score preservation,
  faster equal-score replacement with sub-display precision, exact equality,
  canonical Unicode/case/whitespace name matching, shared ranks `1,2,2,4,5,5,7`,
  all fifth-rank highlights, stable tie ordering, persistent reload of saved data,
  duplicate round protection, all required storage failures, invalid data/entries,
  game-key-only clearing, and completion saving without results navigation.
- `npm.cmd run build`: passed, exit code 0; Vite 8.3.5 transformed 16 modules
  and built in 219 ms. HTML 0.55 kB, CSS 14.38 kB, JS 23.06 kB;
  gzip CSS 4.07 kB and JS 7.72 kB.
- Final `npm.cmd run test:browser`: passed, exit code 0, against its own production
  preview in isolated headless Chrome. Existing feedback, locking, timer, Next,
  results, replay, Home, stale-event, and keyboard checks continue to pass.
- Browser verified one save after answer five before View Results; duplicate
  events and results navigation did not write again. Replaying `Mariam Ali` as
  `  MARIAM   ALI  ` with 0/5 retained the saved 3/5 result and showed accurate
  existing-best status. First results showed new-best status. Results leaderboard
  identified the saved row and Back restored results and button focus.
- Clear dialog opened; Cancel preserved the original raw JSON. Simulated deletion
  failure reported failure and retained rows/data. Successful Clear removed only
  this game's key and displayed an empty state. Unrelated sentinel data survived.
- Seeded test ties displayed ranks `1,2,2,4,5,5,7`, with six highlighted rows and
  the seventh row accessible. Refresh preserved all seven. A markup-like name
  appeared as literal text and created no image/HTML nodes.
- Browser-injected read/parse/write/remove errors were reported honestly. Complete
  5/5 games still worked with malformed data and simulated quota failure; results
  did not claim successful saves. Malformed bytes were unchanged until explicitly
  cleared. No real event data was accessed or erased by these checks.
- Inspected leaderboard screenshots at 1440x960 and 320x740; no horizontal
  overflow. Evidence: ignored `.tmp/milestone-5-leaderboard-laptop.png` and
  `.tmp/milestone-5-leaderboard-narrow-phone.png`. Also inspected the existing
  results layout with new-best status. Current-player evidence is in
  `.tmp/milestone-4-current-player.png` (the shared browser regression artifact).
- No runtime exceptions were recorded in the final full browser run. Test
  preview and browser were stopped automatically.
- Preservation checks passed: original landing stylesheet, game engine, and all
  existing game/results style rules are byte-identical to their baselines. Landing
  markup differs only in its preparation-status copy; existing buttons are enabled
  through wiring. SHA-256 checks confirmed all 31 supplied assets and both
  authoritative instruction documents remain unchanged.

### Remaining manual checks and scope

Run `npm.cmd run dev` and review the full journey on the event laptop and a
physical phone. Check touch navigation, screen-reader table/feedback announcements,
dialog focus and Escape/Cancel, and Back to results/landing. Confirm the intended
event browser permits persistent storage and refresh retains a test score; storage
failures above were injected in Chrome, not produced by actual device privacy
settings. Clear test scores only through an intentional organizer action, avoiding
real event scores. Real background-tab timing remains a device check from earlier
milestones; the unchanged engine's timestamp behavior is covered by tests.

Scores belong to one browser profile and origin, not a GitHub account. Publishing
will not share scores between devices or transfer localhost data to Pages. The
README explains using one event device/browser for a common event leaderboard.

No Milestone 5 blockers remain. **Milestone 6 - Interaction and visual polish**
is next and has not been started. No backend, authentication, shared online scores,
visual-polish pass, release preparation, or deployment was implemented.

## Historical Milestone 4 completion (2026-10-23)

Read the plan, companion prompts, and existing progress record completely before
editing. Completed answer feedback, frozen results, replay, and Home only.

### Delivered and changed files

- `src/round-view.js`: accepted correct choices show a green glowing selected
  border and the exact message `YAY! YOU FOUND THE AI!`; incorrect choices show
  a red glow and `Oops! This one is a real image.` Both cards reveal visible AI/
  Real labels and updated accessible names only after acceptance. Cards remain
  locked and the selected feedback persists until the player advances.
- Next is hidden until answering questions 1-4. It never advances automatically.
  Rebuilt questions remove old feedback, labels, selection colors, and accessible
  type names before becoming playable. Existing engine guards remain, with added
  view/round/index guards so stale controls cannot affect a replay or dismiss the
  final feedback. View Results appears after answer five; timer finalization still
  happens in the unchanged engine before rendering feedback.
- Results display the immutable attempt's player name, score out of five, and
  final formatted time. User names are assigned with `textContent`. Navigation
  does not recompute elapsed time or score. Final feedback remains until View
  Results is clicked.
- Play Again returns to the existing landing, retains the cleaned name, creates
  one new engine, selects/preloads a fresh five-pair round, and requires explicit
  Start. A fresh selection can legally include pairs from the previous round.
  Home returns to that landing and clears name, count, errors, and composition
  state for the next player. Old animation callbacks are canceled and guarded by
  engine identity; existing particles are retained instead of recreated.
- `src/game.css`: green/red feedback glows and contrast-safe message colors;
  responsive results card using the existing typography, rounded controls,
  shadows, and Google accents. No changes to the landing stylesheet.
- `src/main.js`: adds only a callback to reset name-validation state on navigation;
  its landing template is unchanged. No landing branding, grid, particle,
  typography, palette, layout, or animation changes.
- `scripts/browser-session.mjs` and `scripts/check-round-flow.mjs`: repeatable
  browser integration checks using installed Chrome/Edge and an isolated profile.
- `package.json`: adds `npm.cmd run test:browser`; no new dependencies or lockfile
  changes. `README.md`: current flow and browser-check instructions.
- Updated this record. `src/game.js`, verified pairs, supplied pictures/logo,
  authoritative instruction files, and `src/style.css` are unchanged.

### Checks actually performed

- `npm.cmd test`: passed, exit code 0. Existing asset audit passed for all 15
  pairs/30 distinct WebP paths and the PNG logo. All 15 deterministic Node tests
  passed, preserving scoring, preparation, input guards, and exact timer-stop
  behavior from Milestone 3.
- `npm.cmd run build`: passed, exit code 0. Vite 8.3.5 transformed 13 modules;
  final build took 222 ms. HTML 0.55 kB, CSS 11.59 kB, JS 15.95 kB;
  gzip CSS 3.47 kB and JS 5.50 kB.
- Final `npm.cmd run test:browser`: passed, exit code 0, against an automatically
  started production preview. Completed two full rounds: DOM button activation
  yielded 3/5 with both feedback outcomes; native Space/Enter card activation and
  Enter on Next yielded 0/5, including red feedback on the final answer.
- Browser checks confirmed exact messages, selected glow classes, both visible
  type labels, synchronous card disabling, first-answer locking, manual Next,
  repeated/stale Next protection, and clearing of all feedback on new questions.
  Neutral accessible card names and no answer-specific classes or tooltips were
  verified before each question.
- Final feedback retained the frozen time while waiting. View Results preserved
  the same time, score, and cleaned name. Repeated View Results and stale earlier
  Next events did not bypass the intended navigation.
- Replay retained the name and prepared exactly one fresh selection (19 controlled
  random draws: 14 Fisher-Yates swaps plus 5 positions); double replay and stale
  card/Next/results/replay events could not change the new round. It stayed on the
  landing until explicit Start, then began at Question 1 and Score 0/5.
- Home cleared name, character count, and validation messages; Start was disabled
  and focus returned to the input. Results heading received focus on results
  navigation. Keyboard focus styling was checked. Leaderboard stayed disabled.
- A sentinel localStorage value in the isolated test origin remained untouched;
  no additional entries appeared. No real browser/event scores were used. Product
  code adds no storage access and never saves unfinished or completed attempts.
- Laptop 1440x960, phone 390x844, and narrow-phone 320x740 results screenshots
  fit without horizontal overflow. Inspected laptop/phone results and both
  feedback screenshots. Full images remain visible in equal contain-sized frames.
  Evidence: ignored `.tmp/milestone-4-correct-laptop.png`,
  `.tmp/milestone-4-wrong-phone.png`, `.tmp/milestone-4-results-laptop.png`,
  `.tmp/milestone-4-results-phone.png`, and `.tmp/milestone-4-results-narrow-phone.png`.
- Browser runs ended with no runtime exceptions, and particle count remained 11
  after replay/Home. The test preview and headless browser were stopped afterward.
- Preservation checks passed: original landing stylesheet, Milestone 3 engine,
  and landing template match their baselines byte-for-byte. SHA-256 hashes of all
  31 supplied assets and both instruction documents remain unchanged.

### Outstanding manual checks and next milestone

Run `npm.cmd run dev` and review on the event laptop and a physical narrow phone.
Verify actual mouse/touch choices, readability of green/red glows and labels,
scrolling to Next, long/Unicode names on results, and replay/Home with the mobile
keyboard. Check screen-reader announcements of feedback and focus changes;
physical-device touch and assistive technology were not tested by automation.
Real background-tab switching remains a manual device check from Milestone 3;
timestamp behavior without callbacks remains covered by deterministic tests.

No Milestone 4 blockers remain. **Milestone 5 - Local leaderboard** is next and
has not been started. Leaderboard is visibly unavailable; no fake saved result,
personal-best status, storage implementation, or deployment has been added.

## Historical Milestone 3 completion (2026-10-23)

Read the plan, companion prompts, and progress record completely. Implemented
only round preparation, engine, scoring, continuous timing, and a basic comparison
view. The existing landing design is preserved.

### Delivered and changed files

- `src/game.js`: Fisher-Yates shuffle of the verified pool, five unique pairs,
  five independent AI-position draws, explicit preparation/ready/answer/feedback/
  completion states, validated Start, synchronous first-answer lock, score,
  question-specific guards for stale/repeated Next and answer events, and one
  immutable completed attempt with `roundId`, `playerName`, `score`, `elapsedMs`.
  Defaults use `crypto.randomUUID()` and monotonic `performance.now()`.
- `src/preparation.js`: base-aware loading and full decoding of all ten selected
  images, dimension validation, failure handling, and a 15-second loading timeout.
  Retry retains the selected pairs rather than substituting or reducing the pool.
- `src/round-view.js`: loading/error/Retry status in the existing landing status
  area; Start requires a valid name and all ten decoded images. Reuses the decoded
  image elements in two neutral Image A/Image B buttons, equal outer frames, and
  `object-fit: contain`. Includes question, score, count-up clock, and manual Next.
  Both cards disable immediately on selection. New question content is created
  before it becomes playable. Native buttons support keyboard and pointer input.
- Timing starts in the accepted Start handler immediately before displaying the
  prepared comparison. Redraw callbacks read timestamps; they do not count time.
  Feedback and Next delays remain included. Answer five captures the unrounded
  elapsed milliseconds and creates the attempt before updating completion text;
  the redraw loop then stops. Display is `mm:ss.hh`, with minutes allowed above 59.
- `src/game.css`: comparison-only styles reusing existing colors, typography,
  buttons, rounded frames, and shadows. Side-by-side on laptops, stacked on phones.
  The original `src/style.css` and `src/particles.js` were not edited.
- `src/main.js`: wires preparation/Start into existing name validation and form
  submission; the landing markup changes only its preparation-status content and
  live-status attributes. Leaderboard remains disabled. No landing redesign.
- `tests/game.test.js`: 12 deterministic engine/preparation tests using controlled
  randomness, timestamps, IDs, and image decode promises; existing 3 name tests
  and the asset audit remain active in `npm.cmd test`.
- `README.md` and this record: updated current behavior and next milestone.
  No dependencies, lockfile, verified pairs, or supplied assets were changed.

### Actual verification results

- `npm.cmd test`: passed, exit code 0. Asset audit verified all 15 pairs and logo;
  all 15 Node tests passed (12 new engine/preparation tests, 3 existing name tests).
  Covers exact five-pair selection without mutating the pool, independent sides,
  waiting for all ten decodes, early/repeated Start, blank/long names, error/Retry,
  correct/wrong scoring, repeated/stale answer and Next, feedback time, elapsed
  time without callbacks, exact fifth-answer stop, one completion object, unique
  round IDs, incomplete round abandonment, time display, base-aware image URLs,
  decode failures, invalid dimensions, and timeouts.
- `npm.cmd run build`: passed, exit code 0; Vite 8.3.5 transformed 13 modules
  and built in 278 ms. Final HTML 0.55 kB, CSS 9.95 kB, JS 13.13 kB;
  gzip CSS 3.12 kB and JS 4.80 kB.
- Development server started successfully in 399 ms at port 5173. Production
  preview started successfully at `http://127.0.0.1:5174/`.
- Final `node .tmp/check-game.mjs` against the production preview: passed,
  exit code 0. Browser network blocking verified a readable image error and Retry;
  restoring requests allowed preparation to finish. Blank names block Start;
  decoded images plus valid name enable it. Repeated Start cannot overlap rounds.
- Production-browser full round: five distinct pairs, alternating correct/wrong
  choices produced 3/5, both cards locked, repeated answer/Next events did not
  change scores or skip questions, waiting before Next counted, and the fifth
  answer froze the displayed clock before any later navigation. Refresh returned
  to a blank-name landing and no round state. No localStorage entries were written.
- Browser checks at 1440x960, 390x844, and 320x740: no horizontal overflow,
  equal card sizes, full decoded images with contain sizing, neutral accessible
  labels/empty image alt text, no revealing tooltips. Reduced motion still stops
  all particles, and the final browser run recorded no runtime exceptions.
- Inspected laptop and phone comparison screenshots. Evidence is in ignored
  `.tmp/milestone-3-laptop.png`, `.tmp/milestone-3-phone.png`,
  `.tmp/milestone-3-narrow-phone.png`, and `.tmp/milestone-3-landing.png`.
- `node .tmp/check-preservation.mjs`: passed; original landing stylesheet is
  byte-identical, and original landing markup is identical except its status area.
  SHA-256 checks also confirmed all 31 supplied public files and both authoritative
  instruction documents remain unchanged. Pair records were not modified.

### Scope and manual checks

The fifth answer leaves the basic comparison locked with a frozen clock and a
short completion notice. There is no final feedback/results screen, type reveal,
replay navigation, leaderboard, storage, or deployment. Completed attempts exist
only in memory; incomplete rounds never produce an attempt and refresh abandons
them. Saving completed attempts belongs to Milestone 5.

Run `npm.cmd run dev` to review locally. On the intended event laptop and physical
phone, check touch/keyboard card selection, image comparison comfort, and real
tab switching: wait on feedback, switch away and back, then verify elapsed time
includes the interval. Inactive-tab timing is covered deterministically by
advancing the injected clock without rendering callbacks; real device/tab
switching and screen-reader behavior still need manual verification. Automated
checks were Chrome desktop/headless, not a physical phone.

No Milestone 3 blockers remain. **Milestone 4 - Feedback, results, and replay**
is next and has not been started. Verification servers were stopped afterward.

## Historical Milestone 2 completion (2026-10-23)

Read the full plan, companion milestone prompts, and this progress record before
implementation. Completed only the landing page and shared visual theme.

### Delivered and changed files

- `src/main.js`: replaced the setup placeholder with supplied logo branding,
  large centered GDG AAUP title, AI OR REAL subtitle, the exact round instruction,
  labeled name entry, Start/Leaderboard buttons, concise supporting text, and footer.
  The logo still uses the existing Vite base-aware `assetUrl()` resolver. Both
  buttons use native `disabled` and have a visible coming-soon explanation.
- `src/style.css`: pure-white background, subtle light-gray grid, rounded form
  card, restrained shadows, Google blue/red/yellow/green accents, hover/focus
  styling, responsive laptop/phone layouts, and reduced-motion overrides.
  Mobile inputs use 16px text to avoid automatic focus zoom on iOS.
- `src/particles.js`: one bounded set of 11 CSS-animated particles/code symbols;
  no requestAnimationFrame loop, timers, external libraries, or duplicate creation.
  Decorations have `aria-hidden`, cannot intercept input, and stay behind content.
- `src/name.js`: NFC Unicode normalization, trimmed edges, collapsed whitespace,
  and a 30-code-point limit without splitting surrogate pairs. Normalization is
  committed on blur/submission; overlong input is capped immediately, with a
  notice. IME input is capped after composition ends. Names retain their case.
- `tests/name.test.js`: three focused checks covering blank/pasted whitespace,
  Arabic/accented names, and 30-character boundaries including Unicode characters.
- `package.json`: `npm.cmd test` now runs the existing asset audit and Node tests.
  No dependency or lockfile changes were needed.
- `README.md`: current scope, name-entry behavior, test command, and next milestone.
- `docs/progress.md`: this completion record. Temporary browser scripts and
  screenshots are in ignored `.tmp/`; they are not part of the shipped app.

### Checks actually performed

- `npm.cmd test`: passed, exit code 0. All 15 pairs/30 distinct WebP paths and
  the PNG logo passed the existing audit; all three name tests passed.
- `npm.cmd run build`: passed, exit code 0. Vite 8.3.5 transformed 8 modules
  and built in 352 ms. Final output: HTML 0.55 kB, CSS 7.85 kB, JS 5.84 kB
  (reported gzip CSS 2.62 kB and JS 2.47 kB).
- An initial CSS build failed because a stray UTF-8 BOM remained at the end of
  the edited stylesheet. Removed it and confirmed successful subsequent builds.
- Development server started at `http://127.0.0.1:5173/` in 360 ms.
- `node .tmp/check-landing.mjs`: final headless Chrome run passed, exit code 0.
  Verified laptop 1440x960, phone 390x844, and narrow phone 320x740 layouts;
  no horizontal overflow, form card fits, and actual logo decodes.
- Visually inspected the laptop, phone, and narrow-phone screenshots. The grid,
  headings, logo, form, and footer remain readable and unobscured; narrow screens
  scroll vertically as needed. Evidence: `.tmp/milestone-2-laptop.png`,
  `.tmp/milestone-2-phone.png`, and `.tmp/milestone-2-narrow-phone.png`.
- Browser DOM/interaction checks passed: blank name rejected with accessible
  error, whitespace normalized on blur, long names limited, Arabic and emoji
  preserved, IME composition not interrupted, disabled buttons remain disabled
  for valid names, form submission/Enter cannot start gameplay, and keyboard Tab
  shows a visible focus indicator.
- Browser reduced-motion emulation confirmed all particle animations stop.
  Decorations are hidden from accessibility and noninteractive. No browser
  runtime exceptions were recorded in the final run.
- SHA-256 comparison: all 31 supplied public assets match the original baseline;
  both supplied instruction documents remain unchanged. The verified pair module
  and Milestone 1 asset audit remain in place.

### Manual review for Mariam

Run `npm.cmd run dev` from the project root and open Vite's printed URL.
Review the title/logo balance, spacing, subtle motion, and colors on the intended
event laptop and a physical phone. Check touch focus, the mobile keyboard, real
clipboard paste, and screen-reader announcements with the device's own tools;
these were not verified on physical devices. Test blank and long names, Tab to
the name field, and enable the OS reduced-motion setting. Start and Leaderboard
must remain unavailable, including after a valid name is entered.

No Milestone 2 blockers remain. Milestone 3 (round engine and continuous timer)
is next and has **not** been started. No rounds, image preloading, scoring,
timer, results, leaderboard storage, backend, or deployment were implemented.

## Historical Milestone 1 verification (2026-10-23)

Read both `GDG-AAUP-AI-or-Real-Plan.md` and
`GDG-AAUP-AI-or-Real-Codex-Prompts.md` completely after they were added.
The initial setup needed the corrections below before it met the documented
Milestone 1 requirements. The project remains directly in
`C:\Users\HASHE\OneDrive\Desktop\ai-or-real`; the suggested folder name in
the plan does not require moving or nesting this existing project.

### Corrections and changed files

- Replaced `src/data/imagePairs.js` with the required `src/data/pairs.js`.
  It exports `pairs` with 15 stable IDs and 30 public-relative paths, such as
  `assets/pictures/beach.webp`, preserving actual filenames, extensions, and case.
- Added `src/assets.js` to resolve paths against `import.meta.env.BASE_URL`;
  updated the logo in `src/main.js` and favicon in `index.html` to use the base.
- Added `vite.config.js` with default base `/` and `.tmp/` excluded from the
  development watcher. The real deployment target/base
  remains for Milestone 8; no target or public URL has been invented.
- Added `README.md` with Node requirements, lockfile installation, local commands,
  current scope, and pair-maintenance instructions.
- Updated `package.json` with Vite's installed Node requirement
  (`^20.19.0 || >=22.12.0`) and noninteractive `npm.cmd test` asset audit.
- Updated `package-lock.json` to match the package engine declaration.
- Updated `scripts/verify-assets.mjs` to use the required pair module and enforce
  the relative-path and real/AI naming convention.
- Added `.tmp/` to `.gitignore` for temporary browser audit files and profile.
- Updated this progress record. The supplied instruction documents are unchanged.

### Re-audit checks actually performed

- `npm.cmd install --package-lock-only --ignore-scripts --offline --no-audit --no-fund`:
  passed; lockfile synchronized without changing the installed Vite version.
- `npm.cmd test`: passed, exit code 0; verified 15 unique IDs, 30 distinct paths,
  exact-case existing files, one real and one `_AI` filename per pair, WebP/PNG
  headers, and no extra or unpaired pictures. The full pairing table is below.
- `npm.cmd run build`: passed, exit code 0; Vite 8.3.5 transformed 6 modules
  and built the production entry, JavaScript, and CSS in 206 ms on the final run.
- `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort`: started
  successfully in 316 ms on the final run. HTTP GET of
  `http://127.0.0.1:5173/` returned 200 after the watcher fix.
- Headless Chrome loaded a temporary audit page through the Vite development
  server. All 30 pictures and the logo passed `HTMLImageElement.decode()` and
  had positive natural dimensions. The screenshot displayed the successful
  decoding status. Inspected its contact sheet: all 15 pairs share their expected
  subject, with no missing or ambiguous pairing found. Real/AI provenance remains
  the supplied `_AI` labeling; visual inspection is not a provenance detector.
- Temporary visual evidence: `.tmp/asset-audit.png` (ignored, not part of the app).
  The temporary audit page is for inspection only and is not an app screen.
- The initial audit run exposed Vite watcher EBUSY messages for Chrome profile
  cookie files under `.tmp/`. Excluded that generated directory from watching;
  restarted the server and reran the asset audit/build after this configuration fix.
- SHA-256 checks confirmed that both instruction files are unchanged and that
  all 31 public files match the production copies. Original public asset hashes
  also match the baseline from the initial setup.
- Package dependency and Node engine declarations match `package-lock.json`.
  Node.js v24.16.0 meets the installed Vite requirement; npm is 11.13.0.

### Gate and next milestone

Milestone 1 is complete: existing Vite setup reused, working entry and suitable
scripts present, README supplied, assets/docs preserved, exact pair list at the
required path, picture loading checked, development server starts, build passes.
No Milestone 1 blockers remain. A production preview/subpath browser check and
responsive interaction checks remain for their later milestones; they are not
claimed as performed here.

To review locally, run `npm.cmd run dev` from the root and open the URL printed
by Vite (normally `http://localhost:5173/`). The audit server was stopped after
verification. The page intentionally remains the minimal setup page.

Next unfinished milestone: **Milestone 2 - Landing and shared Google theme**.
It has not been started. No registration, theme, particles, gameplay, leaderboard,
or deployment work was added during this review.

## Historical initial setup record (2026-10-23, before instructions were available)

Confirmed project root: `C:\Users\HASHE\OneDrive\Desktop\ai-or-real`.
The workspace initially contained only `public/`, with the existing logo and pictures.
`package.json` was absent, explaining the reported npm ENOENT error.

Neither `docs/GDG-AAUP-AI-or-Real-Plan.md` nor
`docs/GDG-AAUP-AI-or-Real-Codex-Prompts.md` was present during inspection.
Milestone 1 was completed using the setup requirements in the user's request;
no missing planning documents were recreated or inferred.

### Setup delivered

- Initialized Vite with vanilla JavaScript directly in the existing project root; no nested project.
- Added `package.json`, npm-generated `package-lock.json`, `index.html`, and `.gitignore`.
- Added `src/main.js` and `src/style.css` with a minimal setup status page using the existing logo.
- Added `src/data/imagePairs.js` documenting the actual filenames and public URLs.
- Added `scripts/verify-assets.mjs`, runnable with `npm.cmd run verify:assets`.
- Available scripts: `dev`, `build`, `preview`, and `verify:assets`.
- Installed Vite 8.3.5 (declared as `^8.3.5`, resolved in the lockfile).
- Environment: Node.js v24.16.0; npm 11.13.0.

### Verified image pairs

All files below exist under `public/assets/pictures/`, with the exact casing shown.
Real/AI labels follow the supplied filename convention; image provenance was not independently assessed.

| Pair | Real filename | AI filename |
| --- | --- | --- |
| beach | beach.webp | beach_AI.webp |
| bicycle | bicycle.webp | bicycle_AI.webp |
| breakfast | breakfast.webp | breakfast_AI.webp |
| cat | cat.webp | cat_AI.webp |
| disco | disco.webp | disco_AI.webp |
| dog | dog.webp | dog_AI.webp |
| fall | fall.webp | fall_AI.webp |
| field | field.webp | field_AI.webp |
| forest | forest.webp | forest_AI.webp |
| heart | heart.webp | heart_AI.webp |
| hospital | hospital.webp | hospital_AI.webp |
| houses | houses.webp | houses_AI.webp |
| night | night.webp | night_AI.webp |
| pancake | pancake.webp | pancake_AI.webp |
| swim | swim.webp | swim_AI.webp |

### Actual validation results

- `npm.cmd install --save-dev vite@latest`: passed; added 15 packages, audited 16 packages, reported 0 vulnerabilities. The initial sandboxed attempt failed with EPERM while accessing the external npm cache; the approved retry succeeded.
- `npm.cmd run verify:assets`: passed, exit code 0. Verified 15 unique pairs, 30 unique image paths, exact filename casing, nonempty files, WebP headers, no unexpected/unpaired picture files, and the PNG logo signature. This checks file structure and headers, not full image decoding.
- `npm.cmd run build`: passed, exit code 0, using Vite 8.3.5; 5 modules transformed, build completed in 393 ms and produced `dist/index.html` plus bundled JavaScript/CSS.
- `npm.cmd ls --depth=0`: passed; Vite 8.3.5 installed in the confirmed project root.
- SHA-256 hashes of all 31 original public files matched the hashes recorded before setup. The logo and all pictures remain unchanged.
- All 31 public assets were also present in `dist/` with matching hashes after the build.
- No browser interaction or visual review was performed.

To run locally from the project root: `npm.cmd run dev`.
To rebuild: `npm.cmd run build`. To serve the production build: `npm.cmd run preview`.

Milestone 2 has not been started. No gameplay, scoring, timers, or subsequent milestone features were implemented.
