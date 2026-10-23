# GDG AAUP AI or Real Codex Milestone Prompts

**Task owner:** Mariam  
**Specification:** `docs/GDG-AAUP-AI-or-Real-Plan.md`  
**Final milestone:** Deploy the finished game on GitHub Pages.

## Before the first prompt

1. Create or open `gdg-aaup-ai-or-real` in VS Code.
2. Put both Markdown files in its `docs/` folder, keeping the filenames shown here.
3. Put supplied logos in `public/assets/branding/` and the 30 game pictures in `public/assets/pictures/`. Tell Codex if any assets are missing.
4. Make sure Node.js and npm are available. Install the official OpenAI Codex extension, open its sidebar, and follow its sign-in steps.
5. Send one milestone prompt at a time. After each milestone, review the result in the browser before sending the next. Use the correction template below if needed.

The first prompt works for a new folder or an existing Vite project. Codex must inspect first and preserve existing work.

## Milestone 1 Project setup and asset audit

```text
Read docs/GDG-AAUP-AI-or-Real-Plan.md completely. It is the source of truth for the GDG AAUP AI OR REAL game. Read applicable repository instructions and inspect the workspace before editing.

Complete milestone 1 only: project setup and asset audit.

1. Reuse the existing Vite setup if present. If this is a new folder containing docs and assets, set up Vite with vanilla JavaScript, HTML, and CSS without overwriting them or creating a nested app. Establish package.json, a lockfile, suitable scripts, .gitignore, and a working entry point. Follow the installed Vite version's Node requirements.
2. Inspect public/assets/branding/ and public/assets/pictures/. Report actual files and proposed real/AI pairings. Verify 15 pairs and 30 distinct image references. AI appears in the AI filenames. Preserve filenames, extensions, and case. Do not invent substitute assets or guess ambiguous matches.
3. Create src/data/pairs.js using confirmed stable IDs and real/AI paths that can be resolved against Vite's base URL. Report missing or ambiguous assets and ask only for the information needed to resolve them. Continue independent setup, but do not claim an incomplete collection is ready.
4. Create README.md with local setup/run instructions and docs/progress.md with milestone status, checks actually performed, blockers, and a reviewable pairing audit.
5. Verify the development server can start and run the production build. Do not add a backend, AI API, accounts, or an unnecessary framework.

Report changed files, asset status, commands and outcomes, and how to open the local page. Stop after milestone 1. Do not publish yet.
```

**Review:** The app starts, assets are preserved, and you have checked the pair mappings.

## Milestone 2 Landing and shared Google theme

```text
Read docs/GDG-AAUP-AI-or-Real-Plan.md and docs/progress.md. Complete milestone 2 only, preserving the verified setup and assets.

Build the landing page and shared theme: white light-gray grid background; floating particles and <> symbols in Google blue, red, yellow, and green; supplied branding; large attractive GDG AAUP title centered in the landing area; AI OR REAL below it; name field; Start; and Leaderboard. Follow the plan's palette and short instruction text.

Use dark readable text, clean spacing, consistent buttons, subtle transitions, visible keyboard focus, phone/laptop layouts, and reduced-motion support. Preserve the supplied logo's colors and proportions. Keep decoration lightweight, noninteractive, and behind the content.

Clean and validate the name as specified. Keep unimplemented actions clearly unavailable until later milestones; do not fake gameplay or saved results. Remove the default Vite demonstration UI. Do not add unrequested modes, sounds, login, or long landing-page explanations.

Check laptop and narrow phone layouts if browser tools are available; otherwise list the manual visual checks I should perform. Run the build, update docs/progress.md, report outcomes, and stop after milestone 2.
```

**Review:** Check the title, logo, colors, grid, particles, and name field on both screen sizes.

## Milestone 3 Round engine and continuous timer

```text
Read the plan and progress record. Complete milestone 3 only: round engine, preparation, score, and timing, connected to a basic playable comparison view.

Select five distinct pairs using an unbiased shuffle, independently shuffle AI position for each question, and prepare a fresh selection per game. Preload the selected ten images before enabling Start. Require a valid name and provide loading/error/retry states. Do not start a broken timed game.

Start timing as the first prepared question becomes playable. Show question number, score out of five, and count-up time. Use timestamp-based elapsed time rather than counting timer callbacks. Accept only the first choice, lock synchronously, and add one point only for the AI choice. Guard repeated Start, answer, and Next events.

The clock includes ALL time from Start through acceptance of answer 5, including feedback and manual Next delays after questions 1 to 4. It must continue while the tab is inactive. Stop at the fifth accepted answer before rendering final feedback. Create one completed attempt with name, score, elapsed time, and a round identity or equivalent duplicate guard. Never save unfinished games. Refresh abandons an unfinished round.

Use neutral pre-answer image labels and base-aware asset URLs. Add deterministic checks for unique selection, controlled position randomization, answer locking, scoring, Next double-click protection, feedback time being included, and exact final stop. Do not add a pause, countdown, or time limit.

Run relevant checks and build. Update docs/progress.md, explain what is ready and what remains for milestone 4, and stop.
```

**Review:** Five unique pairs appear, repeated clicks cannot change an answer, and waiting before Next increases the final time.

## Milestone 4 Feedback results and replay

```text
Read the plan and progress record. Complete milestone 4 only: finish the visible game flow using the existing engine and approved design.

Correct choice: selected border glows green; exact text is YAY! YOU FOUND THE AI!
Wrong choice: selected border glows red; exact text is Oops! This one is a real image.

Reveal AI and Real labels after either answer, retaining the chosen card's feedback. Before selection, hide revealing filenames, tooltips, color cues, and accessible labels.

Use manual Next after questions 1 to 4, clear stale feedback, and prevent skipped questions from repeated input. After answer 5, retain feedback, freeze the already-finalized time, and show View Results. Timer stop must not wait for this button.

Build results with name, current attempt score out of five, formatted final time, Play Again, Home, and Leaderboard. Connect personal-best status in milestone 5; do not show a fake save message now. Play Again prepares a fresh round with the same name and requires Start. Home clears name entry for the next player without deleting scores.

Keep equal image frames with object-fit: contain, readable on laptops and phones. Support mouse, touch, and keyboard. Verify a full five-question journey, both feedback outcomes, repeated Next, results, Home, and replay. Add integration checks where they protect these behaviors.

Run relevant checks and build, update docs/progress.md, report actual verification, and stop after milestone 4.
```

**Review:** Play all five questions. View Results must not affect the frozen time.

## Milestone 5 Best result leaderboard

```text
Read the plan and progress record, especially local storage and ranking. Complete milestone 5 only: implement and connect the local leaderboard.

Use validated, versioned localStorage data and a stable game-specific key. Keep one best entry per normalized name, applying Unicode normalization, trimmed edges, collapsed whitespace, and case-insensitive matching while retaining a readable display name.

Compare higher score first, then shorter unrounded elapsed milliseconds. A faster lower score must never replace a higher score. Replace an equal-score best only if faster. Equal and worse attempts preserve the old entry. Save once on the fifth accepted answer, not on View Results.

Use shared competition ranks for exact score/time ties, such as 1, 2, 2, 4, with stable tied-row ordering. Highlight ranks 1 through 5 including fifth-place ties and show the full remaining list. Display rank, name, score out of five, and time. Identify the current player's saved row and show accurate new-best/existing-best status on results.

Add empty state, navigation, and organizer Clear Leaderboard controls with confirmation, Cancel, and Clear. Delete only this game's key. Handle read, parse, write, and removal errors honestly; keep gameplay usable and do not silently erase malformed data. Render names as text.

Test score-first comparisons, equal-score speed comparisons, exact equality, name normalization, tied ranks, duplicate completion prevention, persistence, clear/cancel, and storage failures. Explain browser/origin storage scope in README: publishing does not create shared online scores.

Run relevant checks and build, update docs/progress.md, report results, and stop after milestone 5.
```

**Review:** Replay with the same name using different spaces/casing. Only a better result should replace its entry; refresh should preserve scores.

## Milestone 6 Responsive polish and complete journey

```text
Read the plan and progress record. Complete milestone 6 only: polish and verify the integrated game without changing its rules.

Review landing, preparation, game, both feedback outcomes, final feedback, results, leaderboard, and clear confirmation. Improve alignment, image proportions, readability, buttons, Google-color accents, white grid, particles, <> symbols, and smooth transitions. Keep the images as the focus.

Check laptop and narrow-phone layouts, mouse/touch/keyboard operation, focus after view changes, reduced motion, missing-image retry, and storage-error messages. Prevent duplicated animations, listeners, rounds, and completion processing during repeated navigation. Do not add modes, sounds, or features outside the plan.

Verify a full round, same-name replay, a new player, leaderboard navigation, refresh persistence, and clear/cancel using test results. Protect any real event scores from destructive checking.

Fix issues and run checks appropriate to those fixes. Update docs/progress.md with actual verification and any manual browser checks still needed. Report outcomes and stop after milestone 6.
```

**Review:** Try the entire experience on the intended event device. Decoration must never obscure pictures or controls.

## Milestone 7 Cleanup and release preparation

```text
Read the full plan and progress record. Complete milestone 7 only: prepare the project for GitHub Pages deployment.

Remove unused Vite demo files, dead code, and redundant files while preserving supplied assets, docs, useful checks, and working behavior. Keep source understandable. Confirm lockfile and scripts work together. Exclude node_modules, dist, local-only files, credentials, and any exported player/test data from source commits.

Audit every picture, logo, and favicon URL for Vite base-path compatibility. Build and preview using a representative repository subpath to catch broken assets. This local compatibility check is not the final GitHub target configuration.

Run relevant tests, production build, and preview. Complete the acceptance checklist that can be verified locally and fix release blockers. Finish README instructions for setup, dev/build/preview, pairing maintenance, game rules, timing, best-result storage, clearing, and local leaderboard limitations.

Inspect Git state and remotes without publishing. Record the known repository target if it can be established; otherwise note missing owner/repository/visibility information for milestone 8. Do not invent a target or redirect an unrelated remote.

Update docs/progress.md with release readiness and blockers. Report checks and missing deployment inputs. Stop after milestone 7. GitHub connection, workflow setup, push, and deployment belong to the final prompt.
```

**Review:** The production preview works and assets load under a subpath. No scoring, timing, saving, or navigation blocker remains.

## Milestone 8 Deploy on GitHub Pages

```text
Read docs/GDG-AAUP-AI-or-Real-Plan.md and docs/progress.md. Complete the final milestone: connect the finished project to the correct GitHub repository, publish with GitHub Pages through GitHub Actions, and verify the live game.

Inspect Git status, branch, remotes, authentication, and existing workflows first. Reuse the confirmed target and preserve unrelated changes. If no target is established, ask for the missing GitHub owner or organization, repository name, and visibility; suggest gdg-aaup-ai-or-real. Check Pages availability for the target. Do not guess identities, overwrite unrelated remotes/history, force-push, or request credentials in chat.

This milestone authorizes publishing this project to the confirmed target. Once required details and access are available, continue through commit, push, Pages setup, workflow execution, and verification rather than stopping at a plan.

Implement section 10 of the plan:
- Check current official Vite/GitHub Pages guidance and supported action versions.
- Configure the correct Vite base for the actual URL: normally /REPOSITORY/ for project Pages, or / for a confirmed root/custom-domain deployment.
- Resolve pictures, logos, and favicon at that base.
- Create or adapt .github/workflows/deploy.yml for pushes to the actual deployment branch and workflow_dispatch. Use compatible supported Node, npm ci, required noninteractive tests, and npm run build.
- Configure Pages, upload generated dist, and deploy that artifact with required permissions, github-pages environment, build/deploy dependency, concurrency, and URL output.
- Select GitHub Actions as Pages publishing source. The docs folder holds instructions, not the website source.
- Keep generated folders and local-only data out of source commits.

Run final relevant checks before pushing. Push to the confirmed target and monitor the workflow through deployment. If it fails, inspect logs, fix the cause within scope, and verify the resulting run. If authentication or a setting requires my action, complete independent preparation and give the exact remaining action. Do not claim deployment when it is blocked.

After success, open the actual reported Pages URL. Check hosted asset loading, a full five-question game, final timer stop, saving, and refresh persistence. Check clear/cancel with test data only when safe. If live browser interaction is unavailable, distinguish confirmed deployment evidence from manual checks I must still perform.

Update README.md and docs/progress.md with confirmed repository URL, workflow run URL, deployed commit, live game URL, and verification outcomes. Commit and push documentation updates if needed; account for any resulting workflow so your report identifies the deployed version accurately.

Give a concise final report with repository link, actual live game link, deployment status, checks performed, and outstanding issues. An expected URL or successful local build is not proof of deployment.
```

**Final review:** Open the published game on the event device. Scores remain local to that browser; localhost results do not transfer automatically.

## Correction prompt

```text
Stay within the current milestone and preserve docs/GDG-AAUP-AI-or-Real-Plan.md.

Screen or action: [where the issue appears]
Current behavior: [what happens now]
Expected behavior: [what should happen]
Evidence: [attach a screenshot or paste the exact error if relevant]

Inspect the cause, implement the focused fix, and run appropriate checks. Update docs/progress.md. Explain what changed in simple English and stop before the next milestone.
```

## Resume prompt

```text
Read docs/GDG-AAUP-AI-or-Real-Plan.md, docs/GDG-AAUP-AI-or-Real-Codex-Prompts.md, and docs/progress.md. Inspect current files and Git status.

Tell me the last completed milestone, blockers, and next unfinished milestone. If the record and actual project disagree, explain the discrepancy. Do not repeat completed work or start another milestone until I send its prompt.
```
