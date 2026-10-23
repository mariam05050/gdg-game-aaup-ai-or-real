import './game.css';
import { pairs } from './data/pairs.js';
import { assetUrl } from './assets.js';
import { cleanName, NAME_LIMIT } from './name.js';
import { RoundEngine, formatElapsed } from './game.js';
import { preloadImages } from './preparation.js';
import { createLeaderboard, normalizeName } from './leaderboard.js';
import { createLeaderboardView } from './leaderboard-view.js';

export function setupRound({ input, startButton, landing, availability, onNameReset }) {
  let images;
  let composing = false;
  let view = 'landing';
  let clockFrame;
  let saveOutcome;
  let leaderboardOrigin;
  const store = createLeaderboard();
  const skipLink = document.querySelector('.skip-link');
  function skipTarget(id, label) {
    skipLink.href = `#${id}`;
    skipLink.textContent = label;
  }
  const statusDot = availability.querySelector('.soon-dot');
  function preparationStatus(message) {
    availability.replaceChildren(statusDot, document.createTextNode(message));
  }
  function createEngine() {
    const nextEngine = new RoundEngine({
      pool: pairs,
      preload: async paths => {
        const decoded = await preloadImages(paths, { resolveUrl: assetUrl });
        if (engine === nextEngine) images = decoded;
      },
    });
    return nextEngine;
  }
  let engine = createEngine();
  const gameView = document.createElement('main');
  gameView.className = 'comparison';
  gameView.hidden = true;
  gameView.setAttribute('aria-labelledby', 'comparison-title');
  landing.after(gameView);
  const resultsView = document.createElement('main');
  resultsView.className = 'round-results';
  resultsView.hidden = true;
  resultsView.setAttribute('aria-labelledby', 'results-title');
  gameView.after(resultsView);
  const leaderboardView = createLeaderboardView({ store, onBack: backFromLeaderboard });
  resultsView.after(leaderboardView.element);
  const landingLeaderboard = landing.querySelector('.button-secondary');
  landingLeaderboard.disabled = false;
  landingLeaderboard.addEventListener('click', () => {
    if (view === 'landing') openLeaderboard('landing');
  });

  function updateStart(isComposing = composing) {
    composing = isComposing;
    const name = cleanName(input.value);
    startButton.disabled = composing || engine.phase !== 'ready' || !name || Array.from(name).length > NAME_LIMIT;
  }

  async function prepare() {
    if (!['idle', 'error'].includes(engine.phase)) return;
    const preparingEngine = engine;
    preparationStatus('Preparing 10 images…');
    availability.setAttribute('aria-busy', 'true');
    const pending = engine.prepare();
    updateStart();
    const ready = await pending;
    if (engine !== preparingEngine) return;
    availability.setAttribute('aria-busy', 'false');
    preparationStatus(ready
      ? 'Images ready. Your next challenge awaits.'
      : 'Pictures could not load. Check your connection.');
    if (!ready) {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'preparation-retry';
      retry.textContent = 'Retry';
      retry.addEventListener('click', prepare);
      availability.append(retry);
      if (view === 'landing') retry.focus();
    }
    updateStart();
  }

  function renderQuestion() {
    const round = engine;
    const index = engine.index;
    const question = engine.questions[index];
    gameView.innerHTML = `
      <div class="comparison-heading"><span class="small-label">AI OR REAL</span><h2 id="comparison-title" tabindex="-1">Choose the AI image</h2></div>
      <div class="round-stats"><span id="question-progress">Question ${index + 1} of 5</span><span id="round-score">Score ${engine.score}/5</span><span class="clock-label">Time <time id="round-clock" aria-label="Elapsed time">${formatElapsed(engine.elapsed())}</time></span></div>
      <div class="image-comparison"></div>
      <div class="round-controls"><p id="round-status" role="status">Choose Image A or Image B.</p><button type="button" class="button button-primary next-question" hidden disabled>Next</button></div>
    `;
    const cards = question.images.map((path, imageIndex) => {
      const card = document.createElement('button');
      card.className = 'image-card';
      card.type = 'button';
      card.setAttribute('aria-label', `Choose image ${imageIndex === 0 ? 'A' : 'B'}`);
      const label = document.createElement('span');
      label.className = 'image-label';
      label.textContent = `Image ${imageIndex === 0 ? 'A' : 'B'}`;
      const frame = document.createElement('span');
      frame.className = 'image-frame';
      const image = images.get(path); // Reuse the decoded image, not a fresh request.
      image.alt = '';
      image.draggable = false;
      frame.append(image);
      card.append(label, frame);
      card.addEventListener('click', (event) => {
        // A second click on Start/Next can land on a newly rendered card.
        // Accept fresh clicks and keyboard activation, not that continued gesture.
        if (event.detail > 1) return;
        if (engine !== round || view !== 'game' || engine.phase !== 'awaiting' || engine.index !== index) return;
        cards.forEach(item => { item.disabled = true; });
        if (!engine.answer(index, imageIndex)) return;
        if (engine.completedAttempt) saveOutcome = store.saveCompletedAttempt(engine.completedAttempt);
        const correct = imageIndex === question.aiIndex;
        card.classList.add(correct ? 'is-correct' : 'is-wrong');
        cards.forEach((item, position) => {
          const type = position === question.aiIndex ? 'AI' : 'Real';
          item.querySelector('.image-label').textContent = `Image ${position === 0 ? 'A' : 'B'} · ${type}`;
          item.setAttribute('aria-label', `Image ${position === 0 ? 'A' : 'B'}: ${type}${position === imageIndex ? ', selected' : ''}`);
        });
        document.querySelector('#round-score').textContent = `Score ${engine.score}/5`;
        document.querySelector('#round-clock').textContent = formatElapsed(engine.elapsed());
        const complete = engine.phase === 'complete';
        const feedback = document.querySelector('#round-status');
        feedback.textContent = correct ? 'YAY! YOU FOUND THE AI!' : 'Oops! This one is a real image.';
        feedback.className = correct ? 'feedback-correct' : 'feedback-wrong';
        nextButton.textContent = complete ? 'View Results' : 'Next';
        nextButton.hidden = false;
        nextButton.disabled = false;
        if (complete) cancelAnimationFrame(clockFrame);
        nextButton.focus({ preventScroll: true });
      });
      return card;
    });
    gameView.querySelector('.image-comparison').append(...cards);
    const nextButton = gameView.querySelector('.next-question');
    nextButton.addEventListener('click', () => {
      if (engine !== round || view !== 'game' || engine.index !== index) return;
      if (engine.phase === 'complete') {
        nextButton.disabled = true;
        showResults();
        return;
      }
      if (!engine.next(index)) return;
      nextButton.disabled = true;
      renderQuestion();
      document.querySelector('#comparison-title').focus({ preventScroll: true });
    });
  }

  function redrawClock(round) {
    if (engine !== round || view !== 'game') return;
    document.querySelector('#round-clock').textContent = formatElapsed(engine.elapsed());
    if (engine.phase !== 'complete') clockFrame = requestAnimationFrame(() => redrawClock(round));
  }

  function showResults() {
    const round = engine;
    const attempt = round.completedAttempt;
    if (!attempt || view !== 'game') return;
    view = 'results';
    cancelAnimationFrame(clockFrame);
    gameView.hidden = true;
    resultsView.innerHTML = `
      <section class="result-panel">
        <div class="card-accent" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="result-symbol" aria-hidden="true">✦</div>
        <span class="small-label">ROUND COMPLETE</span>
        <h2 id="results-title" tabindex="-1">That's a wrap!</h2>
        <p class="result-intro">A sharp eye. A curious mind.</p>
        <p id="result-player" class="result-player" dir="auto"></p>
        <dl class="result-metrics">
          <div><dt>Correct answers</dt><dd id="result-score"></dd></div>
          <div><dt>Your time</dt><dd id="result-time"></dd></div>
        </dl>
        <button type="button" class="button button-primary play-again">Play Again <span aria-hidden="true">↗</span></button>
        <div class="result-actions">
          <button type="button" class="button button-secondary result-home">Home</button>
          <button type="button" class="button button-secondary result-leaderboard">Leaderboard</button>
        </div>
        <p id="result-availability" class="availability" role="status"></p>
      </section>
    `;
    resultsView.querySelector('#result-player').textContent = attempt.playerName;
    resultsView.querySelector('#result-score').textContent = `${attempt.score}/5`;
    resultsView.querySelector('#result-time').textContent = formatElapsed(attempt.elapsedMs);
    updateBestStatus();
    resultsView.querySelector('.result-leaderboard').addEventListener('click', () => {
      if (view === 'results' && engine === round) openLeaderboard('results');
    });
    resultsView.querySelector('.play-again').addEventListener('click', () => returnToLanding(round, attempt.playerName));
    resultsView.querySelector('.result-home').addEventListener('click', () => returnToLanding(round, ''));
    resultsView.hidden = false;
    skipTarget('results-title', 'Skip to results');
    window.scrollTo(0, 0);
    resultsView.querySelector('#results-title').focus({ preventScroll: true });
  }

  function updateBestStatus() {
    const status = resultsView.querySelector('#result-availability');
    const attempt = engine.completedAttempt;
    if (!status || !attempt) return;
    status.classList.remove('storage-error');
    const saved = store.read();
    if (saveOutcome?.status === 'error' || !saved.ok) {
      status.textContent = `This attempt could not be saved. ${saveOutcome?.message || saved.message}`;
      if (saveOutcome?.status !== 'error') status.textContent = `Saved-best status is unavailable. ${saved.message}`;
      status.classList.add('storage-error');
      return;
    }
    const best = saved.entries.find(entry => entry.nameKey === normalizeName(attempt.playerName));
    status.textContent = !best ? 'No saved best for this player on this browser.'
      : best.roundId === attempt.roundId ? 'New personal best! Saved on this browser.'
      : `Existing best kept: ${best.score}/5 · ${formatElapsed(best.elapsedMs)}.`;
  }

  function openLeaderboard(origin) {
    leaderboardOrigin = origin;
    view = 'leaderboard';
    landing.hidden = true;
    resultsView.hidden = true;
    skipTarget('leaderboard-title', 'Skip to leaderboard');
    window.scrollTo(0, 0);
    leaderboardView.open(origin === 'results' ? normalizeName(engine.completedAttempt.playerName) : null);
  }

  function backFromLeaderboard() {
    if (view !== 'leaderboard') return;
    leaderboardView.close();
    view = leaderboardOrigin;
    if (view === 'results') {
      updateBestStatus();
      resultsView.hidden = false;
      skipTarget('results-title', 'Skip to results');
      resultsView.querySelector('.result-leaderboard').focus({ preventScroll: true });
    } else {
      landing.hidden = false;
      skipTarget('player-name', 'Skip to name entry');
      landingLeaderboard.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }

  function returnToLanding(round, name) {
    if (engine !== round || view !== 'results') return;
    view = 'landing'; // Guard double clicks before replacing the completed engine.
    cancelAnimationFrame(clockFrame);
    engine = createEngine();
    saveOutcome = undefined;
    images = undefined;
    composing = false;
    resultsView.hidden = true;
    gameView.hidden = true;
    resultsView.replaceChildren();
    gameView.replaceChildren();
    input.value = name;
    onNameReset();
    landing.hidden = false;
    skipTarget('player-name', 'Skip to name entry');
    window.scrollTo(0, 0);
    prepare();
    input.focus({ preventScroll: true });
  }

  function start() {
    if (view !== 'landing') return;
    updateStart();
    if (startButton.disabled) return;
    input.value = cleanName(input.value);
    renderQuestion(); // Build from decoded images before accepting Start.
    if (!engine.start(input.value)) return;
    view = 'game';
    startButton.disabled = true;
    landing.hidden = true;
    gameView.hidden = false;
    skipTarget('comparison-title', 'Skip to game');
    window.scrollTo(0, 0);
    document.querySelector('#comparison-title').focus({ preventScroll: true });
    const round = engine;
    clockFrame = requestAnimationFrame(() => redrawClock(round));
  }

  startButton.addEventListener('click', start);
  prepare();
  return { updateStart, start };
}
