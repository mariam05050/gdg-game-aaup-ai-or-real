import './leaderboard.css';
import { rankEntries } from './leaderboard.js';
import { formatElapsed } from './game.js';

export function createLeaderboardView({ store, onBack }) {
  const element = document.createElement('main');
  element.className = 'leaderboard-view';
  element.hidden = true;
  element.setAttribute('aria-labelledby', 'leaderboard-title');
  element.innerHTML = `
    <section class="leaderboard-panel">
      <div class="leaderboard-heading"><div><span class="small-label">CURIOUS MINDS, SHARP EYES</span><h2 id="leaderboard-title" tabindex="-1">Leaderboard</h2></div><button type="button" class="button button-secondary leaderboard-back">Back</button></div>
      <p class="leaderboard-scope">Best result per name. Scores belong to this browser.</p>
      <p class="leaderboard-message" role="status"></p>
      <p class="leaderboard-empty" hidden>No scores yet. Play a round to get started.</p>
      <div class="leaderboard-table-wrap"><table class="leaderboard-table"><caption class="visually-hidden">Best scores, ranked by correct answers and then fastest time</caption><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Score</th><th scope="col">Time</th></tr></thead><tbody></tbody></table></div>
      <details class="organizer-controls"><summary>Organizer controls</summary><button type="button" class="button button-secondary clear-leaderboard">Clear Leaderboard</button></details>
    </section>
    <dialog class="clear-dialog" aria-labelledby="clear-title" aria-describedby="clear-description">
      <h2 id="clear-title">Clear all saved scores on this browser?</h2>
      <p id="clear-description">This removes this game's leaderboard only.</p>
      <form method="dialog"><button type="submit" class="button button-secondary cancel-clear" autofocus>Cancel</button><button type="button" class="button button-primary confirm-clear">Clear</button></form>
    </dialog>
  `;
  let currentNameKey = null;
  const dialog = element.querySelector('dialog');
  const message = element.querySelector('.leaderboard-message');
  function render(notice = '') {
    const result = store.read();
    const body = element.querySelector('tbody');
    body.replaceChildren();
    message.textContent = result.ok ? notice : result.message;
    message.classList.toggle('storage-error', !result.ok);
    element.querySelector('.leaderboard-empty').hidden = !result.ok || result.entries.length !== 0;
    element.querySelector('.leaderboard-table-wrap').hidden = !result.ok || result.entries.length === 0;
    if (!result.ok) return;
    for (const entry of rankEntries(result.entries)) {
      const row = document.createElement('tr');
      if (entry.highlighted) row.classList.add('leading-rank');
      if (entry.nameKey === currentNameKey) { row.classList.add('current-player'); row.setAttribute('aria-current', 'true'); }
      for (const value of [entry.rank, entry.displayName, `${entry.score}/5`, formatElapsed(entry.elapsedMs)]) {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.append(cell);
      }
      if (entry.nameKey === currentNameKey) {
        const label = document.createElement('span'); label.className = 'current-player-label'; label.textContent = 'You';
        row.children[1].append(label);
      }
      body.append(row);
    }
  }
  element.querySelector('.leaderboard-back').addEventListener('click', onBack);
  element.querySelector('.clear-leaderboard').addEventListener('click', () => { if (!element.hidden) dialog.showModal(); });
  element.querySelector('.confirm-clear').addEventListener('click', () => {
    // A stale event cannot clear data unless the confirmation is currently open.
    if (!dialog.open) return;
    const result = store.clear();
    dialog.close();
    if (result.ok) render('Leaderboard cleared on this browser.');
    else { message.textContent = result.message; message.classList.add('storage-error'); }
    element.querySelector('.clear-leaderboard').focus();
  });
  return {
    element,
    open(nameKey = null) {
      currentNameKey = nameKey;
      render();
      element.hidden = false;
      element.querySelector('#leaderboard-title').focus({ preventScroll: true });
    },
    close() { if (dialog.open) dialog.close(); element.hidden = true; },
  };
}
