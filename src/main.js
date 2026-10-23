import './style.css';
import { assetUrl } from './assets.js';
import { cleanName, limitName, NAME_LIMIT } from './name.js';
import { createParticles } from './particles.js';
import { setupRound } from './round-view.js';

document.querySelector('#app').innerHTML = `
  <a class="skip-link" href="#player-name">Skip to name entry</a>
  <div class="ambient" aria-hidden="true"></div>
  <div class="site-shell">
  <header class="site-header">
    <div class="brand">
      <img class="brand-logo" src="${assetUrl('assets/branding/logo.png')}" alt="GDG AAUP logo" />
      <div class="brand-name">Google Developer Groups<span>On Campus · AAUP</span></div>
    </div>
    <span class="header-note"><span class="live-dot" aria-hidden="true"></span> A campus full of curious minds.</span>
  </header>
  <main id="main-content" class="landing">
    <section class="hero" aria-labelledby="landing-title">
      <div class="eyebrow"><span class="color-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span> HUMAN INSTINCT. DIGITAL TWIST.</div>
      <h1 id="landing-title">GDG <span class="aaup">AAUP<svg viewBox="0 0 260 16" aria-hidden="true"><path d="M4 11 Q130 -4 256 9" /></svg></span></h1>
      <h2 class="game-title" aria-label="AI OR REAL"><span class="ai-word">AI</span><span class="or-word">OR</span><span>REAL<span class="title-dot" aria-hidden="true">.</span></span></h2>
      <p class="instructions">5 pairs. Choose the AI image.<br class="desktop-break" /> The clock keeps running between questions.</p>
    </section>
    <section class="entry-card" aria-labelledby="entry-title">
      <div class="card-accent" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="card-heading"><span class="small-label">A LITTLE INTRODUCTION</span><span class="hello" aria-hidden="true">✦</span></div>
      <h3 id="entry-title">Every great guess starts with you.</h3>
      <form id="name-form" novalidate>
        <div class="label-row"><label for="player-name">Your name</label><span id="name-count" aria-hidden="true">0 / 30</span></div>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
          <input id="player-name" name="playerName" type="text" dir="auto" placeholder="e.g. Mariam" autocomplete="name" enterkeyhint="done" required aria-describedby="name-hint name-status" />
        </div>
        <p id="name-hint" class="field-hint">Up to 30 characters. Make it yours.</p>
        <p id="name-status" class="field-status" aria-live="polite"></p>
        <div class="actions">
          <button class="button button-primary" type="button" disabled aria-describedby="availability"><span>Start</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
          <button class="button button-secondary" type="button" disabled aria-describedby="availability"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 5 4m7-7h4v3a4 4 0 0 1-5 4m-3 1v5m-4 3h8m-8 0v-3h8v3"/></svg><span>Leaderboard</span></button>
        </div>
        <p id="availability" class="availability" role="status" aria-live="polite"><span class="soon-dot" aria-hidden="true"></span> Preparing images…</p>
      </form>
    </section>
    <p class="closing-note">A sharp eye. An open mind. <span>That's all you need.</span></p>
  </main>
  <footer class="site-footer"><span>Made for the curious.</span><span class="footer-signature">Human intuition <span aria-hidden="true">×</span> artificial intelligence</span><span class="color-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></footer>
  </div>
`;

createParticles(document.querySelector('.ambient'));
const input = document.querySelector('#player-name');
const status = document.querySelector('#name-status');
const count = document.querySelector('#name-count');
let composing = false;
let touched = false;
const round = setupRound({
  input,
  startButton: document.querySelector('.button-primary'),
  landing: document.querySelector('.landing'),
  availability: document.querySelector('#availability'),
  onNameReset: () => { touched = false; composing = false; validateName(); },
});

function validateName(commit = false) {
  if (composing) return;
  const cleaned = cleanName(input.value);
  const shortened = Array.from(cleaned).length > NAME_LIMIT;
  if (commit || shortened) input.value = limitName(input.value);
  const blank = !cleanName(input.value);
  input.setAttribute('aria-invalid', String(touched && blank));
  input.setCustomValidity(blank ? 'Enter your name to get ready.' : '');
  count.textContent = `${Array.from(cleanName(input.value)).length} / ${NAME_LIMIT}`;
  status.textContent = touched && blank
    ? 'Enter your name to get ready.'
    : shortened ? 'Your name was shortened to 30 characters.' : '';
  round.updateStart(composing);
}

input.addEventListener('compositionstart', () => { composing = true; round.updateStart(true); });
input.addEventListener('compositionend', () => { composing = false; validateName(); });
input.addEventListener('input', () => validateName());
input.addEventListener('blur', () => { touched = true; validateName(true); });
document.querySelector('#name-form').addEventListener('submit', (event) => {
  event.preventDefault();
  touched = true;
  validateName(true);
  if (!composing && input.checkValidity()) round.start();
  if (!document.querySelector('.landing').hidden) input.focus();
});
