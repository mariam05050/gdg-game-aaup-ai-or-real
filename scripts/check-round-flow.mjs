import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { preview, resolveConfig } from 'vite';
import { openBrowser } from './browser-session.mjs';
import { checkLeaderboardFlow } from './check-leaderboard-flow.mjs';
import { checkInteractions, interactionInstrumentation } from './check-interactions.mjs';
import { pairs } from '../src/data/pairs.js';

await mkdir('.tmp', { recursive: true });
const base = process.env.TEST_BASE_PATH || (await resolveConfig({}, 'build')).base;
const outDir = process.env.TEST_OUT_DIR || 'dist';
assert.ok(base.startsWith('/') && base.endsWith('/'), 'Test base must start and end with /');
const siteUrl = process.env.TEST_SITE_URL;
if (siteUrl) {
  assert.equal(new URL(siteUrl).protocol, 'https:');
  assert.equal(new URL(siteUrl).pathname, base, 'Live test URL must match the production base');
}
const server = siteUrl ? null : await preview({ base, build: { outDir }, preview: { host: '127.0.0.1', port: 0, strictPort: true } });
let browser;
try {
  browser = await openBrowser(Number(process.env.BROWSER_DEBUG_PORT || 9225));
  const { call, evaluate, waitFor } = browser;
  await call('Page.enable'); await call('Runtime.enable');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  await call('Page.addScriptToEvaluateOnNewDocument', {
    source: `${interactionInstrumentation}
      window.__randomCalls = 0; Math.random = () => { window.__randomCalls++; return 0.25; };
      window.__gameWrites = 0; window.__nativeSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if (key === 'gdg-aaup:ai-or-real:leaderboard:v1') window.__gameWrites++; return window.__nativeSetItem.call(this, key, value); };`,
  });
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });
  const origin = siteUrl ? new URL(siteUrl).origin : `http://127.0.0.1:${server.httpServer.address().port}`;
  await call('Page.navigate', { url: `${origin}${base}` });
  await waitFor("document.querySelector('#availability')?.textContent.includes('Images ready')");
  if (siteUrl) assert.equal(await evaluate('localStorage.length'), 0, 'Live checks require an empty isolated profile; never alter existing event data');
  const assetPaths = ['assets/branding/logo.png', ...pairs.flatMap(pair => [pair.real, pair.ai])];
  assert.equal(await evaluate(`(async () => {
    const paths=${JSON.stringify(assetPaths)};
    await Promise.all(paths.map(async path => {
      const image=new Image(); image.src=${JSON.stringify(base)}+path; await image.decode();
      if(!image.naturalWidth || !image.naturalHeight) throw new Error('Image has no dimensions');
    })); return paths.length;
  })()`), 31);
  const pagePaths = await evaluate(`({
    logo:document.querySelector('.brand-logo').getAttribute('src'),
    favicon:document.querySelector('link[rel="icon"]').getAttribute('href'),
    scripts:[...document.querySelectorAll('script[src]')].map(node=>node.getAttribute('src')),
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.getAttribute('href'))
  })`);
  assert.equal(pagePaths.logo, `${base}assets/branding/logo.png`);
  assert.equal(pagePaths.favicon, `${base}assets/branding/logo.png`);
  for (const url of [...pagePaths.scripts, ...pagePaths.styles, pagePaths.favicon]) {
    assert.ok(url.startsWith(base), 'Production asset must use the preview base');
    const response = await fetch(`${origin}${url}`);
    assert.equal(response.status, 200, url);
    if(url.endsWith('.js')) assert.match(response.headers.get('content-type'), /javascript/);
    if(url.endsWith('.css')) assert.match(response.headers.get('content-type'), /css/);
    if(url.endsWith('.png')) assert.match(response.headers.get('content-type'), /image\/png/);
  }
  console.log(`PASS production base ${base}: all 30 pictures and logo decode; favicon, JS and CSS paths serve correctly`);
  await evaluate("localStorage.setItem('unrelated-test-data', 'preserve');");
  await evaluate("{ const input = document.querySelector('#player-name'); input.value = '  Mariam   Ali '; input.dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('.landing .button-primary').click(); }");

  async function screenshot(label, width, height) {
    await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${label}: no horizontal overflow`);
    const { cssContentSize } = await call('Page.getLayoutMetrics');
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: Math.max(height, cssContentSize.height), scale: 1 } });
    await writeFile(`.tmp/milestone-4-${label}.png`, Buffer.from(shot.data, 'base64'));
  }
  async function key(key, code, keyCode) {
    const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, text, unmodifiedText: text });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
  }
  async function playRound(keyboard) {
    for (let index = 0; index < 5; index++) {
      const neutral = await evaluate(`(() => {
        const cards = [...document.querySelectorAll('.image-card')];
        return cards.length === 2 && cards.every(card => /^Choose image [AB]$/.test(card.getAttribute('aria-label')) && !card.title && !card.classList.contains('is-correct') && !card.classList.contains('is-wrong') && card.querySelector('img').alt === '') && document.querySelector('.next-question').hidden && document.querySelector('#round-status').className === '';
      })()`);
      assert.equal(neutral, true, 'new question has no answer clues or old feedback; Next hidden');
      const correct = !keyboard && index % 2 === 0;
      await evaluate(`(() => {
        const cards = [...document.querySelectorAll('.image-card')];
        const ai = cards.findIndex(card => card.querySelector('img').src.includes('_AI'));
        window.__chosen = cards[${correct} ? ai : 1-ai];
        window.__other = cards[${correct} ? 1-ai : ai];
        window.__chosen.focus();
      })()`);
      if (keyboard) {
        if (index % 2 === 0) await key(' ', 'Space', 32); else await key('Enter', 'Enter', 13);
      } else await evaluate('window.__chosen.click()');
      assert.equal(await evaluate("window.__chosen.disabled"), true, `question ${index + 1}: ${keyboard ? 'keyboard' : 'pointer'} choice accepted before repeated events`);
      await evaluate("window.__other.click(); window.__chosen.dispatchEvent(new Event('click'));");
      const state = await evaluate(`(() => ({
        message: document.querySelector('#round-status').textContent,
        color: window.__chosen.classList.contains('${correct ? 'is-correct' : 'is-wrong'}'),
        glow: getComputedStyle(window.__chosen).boxShadow !== 'none',
        locked: [...document.querySelectorAll('.image-card')].every(card => card.disabled),
        types: [...document.querySelectorAll('.image-label')].map(label => label.textContent.split(' · ')[1]).sort(),
        action: document.querySelector('.next-question').textContent,
        score: document.querySelector('#round-score').textContent,
        time: document.querySelector('#round-clock').textContent,
      }))()`);
      assert.equal(state.message, correct ? 'YAY! YOU FOUND THE AI!' : 'Oops! This one is a real image.');
      assert.equal(state.color && state.glow && state.locked, true);
      assert.deepEqual(state.types, ['AI', 'Real']);
      assert.equal(state.action, index < 4 ? 'Next' : 'View Results');
      assert.equal(state.score, `Score ${keyboard ? 0 : Math.floor(index / 2) + 1}/5`);
      if (index < 4) {
        if (!keyboard && index < 2) await screenshot(index === 0 ? 'correct-laptop' : 'wrong-phone', index === 0 ? 1440 : 320, index === 0 ? 960 : 740);
        await new Promise(resolve => setTimeout(resolve, 120));
        assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), `Question ${index + 1} of 5`, 'no automatic advancement');
        await evaluate("window.__oldNext = document.querySelector('.next-question')");
        if (keyboard) await key('Enter', 'Enter', 13); else await evaluate('window.__oldNext.click()');
        await evaluate("window.__oldNext.click(); window.__oldNext.dispatchEvent(new Event('click'));");
        assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), `Question ${index + 2} of 5`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.equal(await evaluate("document.querySelector('#round-clock').textContent"), state.time, 'final feedback cannot change frozen time');
        assert.equal(await evaluate("JSON.parse(localStorage.getItem('gdg-aaup:ai-or-real:leaderboard:v1')).entries.length"), 1, 'completed result persists before View Results');
        assert.equal(await evaluate('window.__gameWrites'), 1, 'duplicate completion and worse replay never write again');
        await evaluate("window.__oldNext.dispatchEvent(new Event('click'))");
        assert.equal(await evaluate("document.querySelector('.round-results').hidden"), true, 'a stale Next from an earlier question cannot open results');
        await evaluate("window.__oldResults = document.querySelector('.next-question'); window.__oldResults.click(); window.__oldResults.dispatchEvent(new Event('click'));");
        assert.equal(await evaluate("document.querySelector('#result-time').textContent"), state.time);
        assert.equal(await evaluate("document.querySelector('#result-score').textContent"), keyboard ? '0/5' : '3/5');
        assert.equal(await evaluate("document.querySelector('#result-player').textContent"), keyboard ? 'MARIAM ALI' : 'Mariam Ali');
      }
    }
    console.log(`PASS ${keyboard ? 'keyboard' : 'pointer'} round: exact feedback, revealed types, first-answer lock, manual Next, double-click protection, final freeze and results values`);
  }
  await playRound(false);
  await screenshot('results-laptop', 1440, 960);
  await screenshot('results-phone', 390, 844);
  await screenshot('results-narrow-phone', 320, 740);
  assert.equal(await evaluate("document.querySelector('.result-leaderboard').disabled"), false);
  assert.match(await evaluate("document.querySelector('#result-availability').textContent"), /New personal best/);
  assert.equal(await evaluate("document.activeElement.id"), 'results-title');
  await evaluate("document.querySelector('.result-leaderboard').click()");
  assert.equal(await evaluate("document.querySelectorAll('tr.current-player').length"), 1);
  assert.match(await evaluate("document.querySelector('tr.current-player').textContent"), /Mariam AliYou/);
  await screenshot('current-player', 1440, 960);
  await evaluate("document.querySelector('.leaderboard-back').click()");
  assert.equal(await evaluate("document.activeElement.classList.contains('result-leaderboard')"), true);
  const callsBeforeReplay = await evaluate('window.__randomCalls');
  await evaluate("window.__oldReplay = document.querySelector('.play-again'); window.__oldReplay.click(); window.__oldReplay.dispatchEvent(new Event('click'));");
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  assert.equal(await evaluate('window.__randomCalls'), callsBeforeReplay + 19, 'exactly one fresh selection on replay');
  assert.equal(await evaluate("document.querySelector('#player-name').value"), 'Mariam Ali');
  assert.equal(await evaluate("document.querySelector('.comparison').hidden && document.querySelectorAll('.image-card').length === 0"), true);
  assert.equal(await evaluate("document.querySelector('.landing .button-primary').disabled"), false);
  console.log('PASS replay retains name, prepares one fresh round, waits for explicit Start, ignores stale controls');
  await evaluate("{ const input=document.querySelector('#player-name'); input.value='  MARIAM   ALI  '; input.dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('.landing .button-primary').click(); window.__chosen.dispatchEvent(new Event('click')); window.__oldNext.dispatchEvent(new Event('click')); window.__oldResults.dispatchEvent(new Event('click')); window.__oldReplay.dispatchEvent(new Event('click')); }");
  assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), 'Question 1 of 5');
  assert.equal(await evaluate("document.querySelector('#round-score').textContent"), 'Score 0/5');
  await playRound(true);
  assert.match(await evaluate("document.querySelector('#result-availability').textContent"), /Existing best kept: 3\/5/);
  await evaluate("{ const home = document.querySelector('.result-home'); home.click(); home.dispatchEvent(new Event('click')); }");
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  assert.equal(await evaluate("document.querySelector('#player-name').value"), '');
  assert.equal(await evaluate("document.querySelector('#name-count').textContent"), '0 / 30');
  assert.equal(await evaluate("document.querySelector('#name-status').textContent"), '');
  assert.equal(await evaluate("document.querySelector('.landing .button-primary').disabled"), true);
  assert.equal(await evaluate("document.activeElement.id"), 'player-name');
  await key('Tab', 'Tab', 9);
  await key('Tab', 'Tab', 9);
  await evaluate("document.querySelector('#player-name').focus()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#player-name')).outlineStyle !== 'none'"), true);
  assert.equal(await evaluate("localStorage.getItem('unrelated-test-data') === 'preserve' && localStorage.length === 2"), true);
  assert.equal(await evaluate("document.querySelectorAll('.particle').length"), 11);
  assert.equal(browser.errors.length, 0, JSON.stringify(browser.errors));
  console.log('PASS Home clears name and validation, restores landing focus, preserves storage; particles stay bounded, no runtime exceptions');
  await checkLeaderboardFlow({ call, evaluate, waitFor });
  await checkInteractions({ call, evaluate, waitFor });
  assert.equal(browser.errors.length, 0, JSON.stringify(browser.errors));
} finally {
  browser?.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
