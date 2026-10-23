# GDG AAUP AI or Real Project Plan

**Owner:** Mariam  
**Organizer:** Siwar  
**Date:** 20 October 2026  
**Project folder:** `gdg-aaup-ai-or-real`  
**Companion file:** `docs/GDG-AAUP-AI-or-Real-Codex-Prompts.md`

## 1 Purpose and source of truth

Build and publish an event-ready GDG AAUP browser game called **AI OR REAL**. Players enter their names, choose the AI image from each of five matching picture pairs, and receive a score out of five. A browser-local leaderboard stores the best result per name, ranked by correct answers and then total elapsed time.

This file is the authoritative implementation specification. Follow the companion prompts one milestone at a time. Preserve these rules during visual improvements. The final milestone includes an actual GitHub Pages deployment and live verification, or a clear report of the specific access or configuration blocker.

## 2 Agreed requirements

| Item | Decision |
| --- | --- |
| Main landing title | GDG AAUP |
| Game name | AI OR REAL |
| Registration | Name only, entered on the landing page |
| Image pool | 15 matching pairs, 30 pictures total |
| Pair contents | One real image and one AI image |
| File identification | Similar names; the AI image has AI in its filename |
| Round length | Five randomly selected pairs |
| Repeats | No repeat within a round; pairs may reappear in later rounds |
| Positions | Randomize AI position independently for each question |
| Answers | One locked choice per pair |
| Correct answer | One point |
| Wrong answer | Zero points; no deduction |
| Progression | Player clicks Next after questions 1 to 4 |
| Timer | Count everything from Start through acceptance of answer 5 |
| Feedback time | Included between questions; the clock does not pause |
| Time limit | None; use a count-up clock |
| Ranking | Higher score first, then shorter total time |
| Replays | Keep only the best result under the same normalized name |
| Leaderboard | Browser-local storage, clearable, with top-five ranks highlighted |
| Final delivery | Source repository and working GitHub Pages URL |

The correct answer comes from the prepared pair list. An AI API, backend, accounts, shared online scores, remote administration, practice mode, sound effects, and extra game modes are outside this task.

## 3 Design and branding

Use a **white background with a subtle light-gray grid**, floating particles, and floating `<>` symbols. Follow this Google-inspired palette unless supplied branding defines more specific values:

| Color | Hex value | Use |
| --- | --- | --- |
| Blue | `#4285F4` | Main actions and accents |
| Red | `#EA4335` | Accents and wrong-answer feedback |
| Yellow | `#FBBC05` | Decorative accents and highlights |
| Green | `#34A853` | Accents and correct-answer feedback |
| White | `#FFFFFF` | Background |
| Dark gray | `#202124` | Text |
| Light gray | `#E8EAED` | Grid and subtle borders |

Use all four Google colors across the interface without making every element multicolored. Preserve supplied logo colors and proportions; do not redraw or recolor the GDG logo.

Center the landing area around a large, attractive **GDG AAUP** title, followed by **AI OR REAL**, the name field, and primary action. Use clean typography, generous spacing, rounded controls, light borders, and subtle shadows. Keep supporting copy short and beginner-friendly.

Particles and code symbols drift gently behind the content. Keep them noninteractive and away from text and image comparison areas. Respect `prefers-reduced-motion`, limit animation work, and avoid duplicate animation loops during navigation.

Image cards use equal outer frames and `object-fit: contain`. Show the full image without stretching or cropping important details. Keep two cards side by side on laptops; stack on narrow phones when needed. Ensure both remain easy to compare.

Use real buttons, visible keyboard focus, readable contrast, and feedback text as well as color. Avoid yellow text on white. Before selection, neither card's color or decoration may suggest which one is AI.

## 4 Technical structure and assets

Use **Vite with vanilla JavaScript ES modules, HTML, and CSS**. Keep one HTML entry and in-app views so the published game does not need server-side route rewrites. Prefer simple modules over extra frameworks.

| Path | Purpose |
| --- | --- |
| `docs/GDG-AAUP-AI-or-Real-Plan.md` | Authoritative requirements |
| `docs/GDG-AAUP-AI-or-Real-Codex-Prompts.md` | Milestone instructions |
| `docs/progress.md` | Completed work, checks, blockers, and next milestone |
| `public/assets/branding/` | Supplied logos and branding |
| `public/assets/pictures/` | All 30 game pictures, separate from branding |
| `src/data/pairs.js` | Verified pair records with stable IDs |
| `src/main.js` | Screens, event wiring, and rendering |
| `src/game.js` | Round state, selection, score, and timing |
| `src/leaderboard.js` | Saving, best-result comparisons, and ranks |
| `src/particles.js` | Background decoration |
| `src/style.css` | Shared and responsive styling |
| `tests/` | Meaningful game and storage checks |
| `index.html` | App entry and metadata |
| `vite.config.js` | Vite settings and deployment base |
| `package.json` and `package-lock.json` | Scripts and reproducible dependencies |
| `.gitignore` | Generated folders and local-only exclusions |
| `.github/workflows/deploy.yml` | Final GitHub Actions deployment |
| `README.md` | Setup, operation, maintenance, and public URL |

### Image audit

Inspect supplied files before creating the pair list. For example, `forest.jpg` and `forest_AI.jpg` could form a pair, but these are examples, not filenames to invent. Preserve actual names, extensions, and letter case.

Each record contains `id`, `real`, and `ai`. Store paths relative to the public root, such as `assets/pictures/forest.jpg`, and resolve them consistently against `import.meta.env.BASE_URL`. Browser URLs must not contain `public/`.

Verify exactly 15 unique pair IDs, 30 distinct file references, one real and one AI image in each pair, existing files, and successful image loading. Similar names alone are not proof of a correct match. Ask Mariam to resolve missing or ambiguous assets; do not invent replacements, silently reduce the pool, or reuse a file across pairs.

Do not reveal filenames, AI status, hover clues, or answer-specific accessible names before selection. Use neutral card labels such as **Choose image A** and **Choose image B**. After answering, label images **AI** and **Real**. This avoids interface clues; the answer list remains inspectable in a static application's source.

## 5 Screens and interactions

### Landing and preparation

Show supplied branding, centered GDG AAUP title, AI OR REAL, a labeled name field, Start, and Leaderboard. Include:

> 5 pairs. Choose the AI image. The clock keeps running between questions.

Trim name edges, collapse repeated spaces, reject blank input, and use a 30-character limit. Handle pasted input consistently and support normal Unicode names.

Prepare five distinct pairs and preload their ten images before enabling Start. Show a loading state. If an image fails, show a readable error and Retry. Start stays disabled until the name and pictures are valid. Starting twice must not create overlapping rounds.

### Game and feedback

Show **Choose the AI image**, **Question 1 of 5**, **Score 0/5**, and the running clock above the main comparison area.

Accept only the first choice. Lock both cards synchronously before updating score or starting animation. Repeated mouse, touch, or keyboard events cannot change the answer.

| Choice | Selected border | Exact message |
| --- | --- | --- |
| Correct AI image | Green glow | YAY! YOU FOUND THE AI! |
| Wrong real image | Red glow | Oops! This one is a real image. |

After either choice, reveal both image types with text labels. Retain the chosen card's green or red feedback. Use manual Next after questions 1 to 4; never advance automatically. Next is available only after answering. Clear old feedback before enabling the new pair and guard repeated Next events against skipping questions.

On answer 5, freeze time immediately, retain final feedback, and show **View Results**. Neither saving nor timer stop may depend on clicking View Results.

### Results and replay

Show player name, this attempt's score out of five, final formatted time, and personal-best status. Distinguish the current attempt from an existing saved best. Provide Play Again, Home, and Leaderboard.

Play Again prepares a new five-pair round using the same name and requires an explicit Start when ready. Home clears name entry for the next player without deleting scores. If an in-game Home action is provided, confirm abandonment and never save an unfinished attempt. Refresh also abandons an unfinished game.

### Leaderboard and clearing

Show rank, player name, best score out of five, and best time. Highlight ranks 1 through 5 and keep all remaining entries accessible. Identify the current player's saved row when arriving from results. Provide an empty state and navigation back to the previous non-game view.

Place **Clear Leaderboard** in organizer controls. This is a local organizer UI, not authenticated administration. Confirm with **Clear all saved scores on this browser?** and Cancel/Clear. Cancel changes nothing. Clear removes only this game's key, then refreshes the list after success. Report removal failures honestly.

## 6 Game state and clock

| State | Accepted action | Next behavior |
| --- | --- | --- |
| Landing or preparing | Name input, loading, Retry | Become ready when valid |
| Ready | Start | Reset score, set start timestamp, open question 1 |
| Awaiting answer | One card choice | Lock answer and record correctness |
| Feedback after questions 1 to 4 | Next | Advance one question; timer continues |
| Feedback after question 5 | View Results | Show frozen result and saved-best status |
| Results | Replay, Home, Leaderboard | Prepare again or navigate |
| Leaderboard | Back or Clear Leaderboard | Navigate or confirm clearing |

Use an unbiased shuffle such as Fisher–Yates, take five unique records, and independently randomize the position of each pair's two pictures. Do not use random sort comparators. Prepare a fresh round for each game.

Timing starts in the accepted Start handler as question 1 becomes playable. Use timestamp-based elapsed time, such as `performance.now()`. Rendering callbacks redraw the clock; they do not determine elapsed time. Background-tab throttling must not pause the clock.

Include feedback, reading, and Next delays after questions 1 to 4. At acceptance of answer 5, capture elapsed milliseconds before rendering feedback, finalize score, and emit one completed attempt with a round identity or equivalent duplicate guard. There is no pause, countdown, or time limit.

Keep unrounded elapsed values for comparisons. Display `mm:ss.hh` consistently, allowing minutes above 59. Display rounding must not change ranking. Save only completed attempts, once. A refresh after a completed fifth answer must not be needed to persist the result.

## 7 Local storage and ranking

### Persistent data

Use a stable game-specific storage key, for example `gdg-aaup:ai-or-real:leaderboard:v1`. Never call `localStorage.clear()`. Store versioned JSON with normalized name key, display name, integer score from 0 to 5, nonnegative elapsed milliseconds, and a saved timestamp for stable ordering of exact ties.

Validate parsed entries. Catch storage read, parsing, writing, and deletion failures. Keep gameplay usable, show when a result could not be saved, and never claim a failed save succeeded. Do not silently destroy malformed data. Render names as text rather than HTML.

### Best result per name

Normalize consistently with Unicode normalization, trimmed edges, collapsed repeated whitespace, and lowercase for matching. Retain the cleaned display name. For example, ` Mariam ` and `mariam` share one entry. Names are labels, not verified accounts; players sharing a name should add an initial.

Replace an old best only when the new score is higher, or its score is equal and time is shorter. Equal or worse results keep the previous entry.

| Saved best | New attempt | Expected result |
| --- | --- | --- |
| No entry | 3/5 in 40 seconds | Create entry |
| 4/5 in 30 seconds | 5/5 in 80 seconds | Replace with higher score |
| 5/5 in 80 seconds | 4/5 in 20 seconds | Keep old best |
| 5/5 in 80 seconds | 5/5 in 70 seconds | Replace with faster equal score |
| 5/5 in 70 seconds | 5/5 in 70 seconds | Keep old entry |

### Ordering and exact ties

Sort score descending, then elapsed milliseconds ascending. Give exact score/time ties shared competition ranks such as `1, 2, 2, 4`. Use saved timestamp and then stable name key only to order tied rows, not to break the displayed rank. Highlight rank 5 ties even if more than five players become highlighted.

### Browser scope

Scores belong to a browser profile and origin, not a GitHub account. Devices, browsers, hostnames, and ports can have separate data. Repository paths on the same Pages host share an origin, so use a game-specific key. Normal redeployments at the same origin retain data when the key stays stable.

Moving from localhost to GitHub Pages does not transfer scores. Publishing does not make the leaderboard shared across devices. Use one event browser and device for one common event list. Clear test scores before the event only through an intentional organizer action.

## 8 Verification and maintenance

Provide scripts for development, production build, preview, and a noninteractive test command. Use the lockfile for reproducible installs. Keep tests focused on behavior, not repeated styling assertions.

Meaningful checks cover five unique pairs, controlled position randomization, first-answer locking, scoring, double-click protection, feedback time being counted, fifth-answer timer stop, duplicate completion prevention, best-result comparisons, name normalization, tied ranks, clear/cancel, and storage failures. Use controlled randomness and timestamps where useful to avoid flaky checks.

Verify a full round, replay under the same name, a different name, persistence after refresh, and the built app under a repository subpath. Check laptop and narrow-phone layouts, touch/mouse/keyboard controls, reduced motion, and image loading failures. Use browser automation if available; otherwise list exact manual checks for Mariam. Do not report a check as passed unless it was performed.

Keep `docs/progress.md` current with the milestone, changed files, commands and outcomes, blockers, and next milestone. Run checks appropriate to each change. Before release, resolve issues affecting assets, scoring, timing, storage, or navigation.

## 9 Milestone sequence

| Milestone | Deliverable | Completion gate |
| --- | --- | --- |
| 1 | Project setup and asset audit | Vite runs; docs/assets preserved; pairing verified or blockers explicit |
| 2 | Landing and shared theme | Reviewable responsive GDG landing |
| 3 | Round engine and timer | Unique pairs, preloading, answer locking, score, and timing checked |
| 4 | Feedback and results | Full game, manual Next, final feedback, results, and replay |
| 5 | Local leaderboard | Best-per-name saving, ranks, highlights, and clear confirmation |
| 6 | Interaction and visual polish | Responsive design, errors, accessibility, and complete journey checked |
| 7 | Release preparation | Cleanup, README, production preview, and subpath check complete |
| 8 | GitHub Pages deployment | Confirmed repo, successful Actions deployment, actual URL and live checks |

Finish one milestone, report the result, and stop for the next prompt. Do not automatically combine future milestones. Resolve routine implementation choices using the simplest approach consistent with this plan. Ask only about unresolved assets, ambiguous data, or external target details that cannot be established safely.

## 10 GitHub Pages deployment

Publish through **GitHub Actions**. The `docs/` folder holds instructions; it is not the website publishing source. Deploy the built `dist/` artifact.

### Confirm the repository

Inspect Git status, branch, remotes, available authentication, and any existing workflow. Reuse the confirmed project repository and preserve unrelated changes. If no target exists, ask for the account or organization, repository name, and visibility; suggest `gdg-aaup-ai-or-real`. Check Pages availability for that target. Never invent an owner, redirect an unrelated remote, force-push, or overwrite unrelated history.

The final milestone authorizes publishing this project to the confirmed target. Continue through necessary commit, push, Pages setup, workflow execution, and verification when access permits. If authentication or a GitHub setting needs user action, complete independent preparation and give the exact remaining action. Do not ask for credentials in chat or report a local build as a deployment.

### Configure paths and automation

For a project page at `https://OWNER.github.io/REPOSITORY/`, configure Vite base `/REPOSITORY/`. A root user/organization page or confirmed custom domain normally uses `/`. Determine the actual target before final configuration. Resolve pictures, logos, and favicon consistently at that base.

Create `.github/workflows/deploy.yml` using current official Vite and GitHub Pages guidance. Verify action versions at implementation time rather than copying stale versions from memory. Require:

- Push triggers on the actual deployment branch and manual `workflow_dispatch`.
- A supported Node version compatible with the project.
- Lockfile install with `npm ci`, required noninteractive checks, then production build.
- Pages configuration, upload of `dist/`, and deployment of that artifact.
- Suitable `contents: read`, `pages: write`, and `id-token: write` permissions.
- A `github-pages` environment, correct build/deploy dependency, and URL output.
- Deployment concurrency control.

Set **Settings → Pages → Build and deployment → Source → GitHub Actions**. Keep `node_modules/`, generated `dist/`, local player data, and local-only configuration out of source commits. Use one Actions artifact strategy rather than also maintaining a separate `gh-pages` branch approach.

### Verify the live game

Monitor the workflow through successful deployment, then open its actual reported URL. Verify branding and images at the hosted path, complete a five-question game, confirm final timer stop, and check saving and refresh persistence. Check clear/cancel using test data only when safe; never erase real event scores as a routine check.

If live interaction is unavailable, distinguish deployment evidence from pending manual browser checks. Record repository URL, workflow run URL, deployed commit, public game URL, and verification outcomes in the progress record and relevant README section. A predicted URL or committed workflow file is not proof that the game is live.

## 11 Acceptance checklist

- [ ] Correct logo, centered GDG AAUP title, and AI OR REAL title.
- [ ] White grid and Google-color particles and floating code symbols.
- [ ] Valid name registration and clear preparation/loading errors.
- [ ] Fifteen verified pairs and thirty working pictures.
- [ ] Five unique pairs each round and shuffled AI position.
- [ ] Equal frames with whole images visible and no pre-answer clues.
- [ ] One accepted answer; repeated events cannot change score or skip questions.
- [ ] Correct green/red feedback and exact messages; both types revealed.
- [ ] Manual Next and uninterrupted clock through answer five.
- [ ] Final time freezes before final feedback and results navigation.
- [ ] Replay, Home, results, and leaderboard navigation work.
- [ ] One saved best per normalized name; score-first comparison and exact ties work.
- [ ] Top-five ranks highlighted with all other entries accessible.
- [ ] Persistence and storage errors handled honestly.
- [ ] Clear confirmation and cancellation affect only this game's data.
- [ ] Phone, laptop, keyboard, touch, and reduced-motion behavior checked.
- [ ] Relevant tests, production build, and preview pass.
- [ ] Built asset paths work under the repository subpath.
- [ ] README and progress record are accurate; unused demo code removed.
- [ ] Confirmed GitHub target and Pages Actions workflow configured.
- [ ] Actual deployment succeeds; live checks completed or explicitly pending.

Before the event, review the image pool for reasonably similar difficulty. Random five-pair sets can vary; preserve the agreed random format and score/time rules.

## 12 Official deployment references

Checked on 20 October 2026. Recheck these when implementing deployment:

- [Vite static deployment and base paths](https://vite.dev/guide/static-deploy)
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
