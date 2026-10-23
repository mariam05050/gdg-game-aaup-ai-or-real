import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { LEADERBOARD_KEY } from '../src/leaderboard.js';

export const interactionInstrumentation = `
  window.__pendingFrames = new Set();
  const nativeFrame = window.requestAnimationFrame;
  const nativeCancel = window.cancelAnimationFrame;
  window.requestAnimationFrame = callback => {
    const id = nativeFrame(time => { window.__pendingFrames.delete(id); callback(time); });
    window.__pendingFrames.add(id); return id;
  };
  window.cancelAnimationFrame = id => { window.__pendingFrames.delete(id); nativeCancel(id); };
  window.__listenerCounts = new WeakMap();
  const nativeListen = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, handler, options) {
    const counts = window.__listenerCounts.get(this) || {};
    counts[type] = (counts[type] || 0) + 1; window.__listenerCounts.set(this, counts);
    return nativeListen.call(this, type, handler, options);
  };
`;

export async function checkInteractions({ call, evaluate, waitFor }) {
  const storageKey = JSON.stringify(LEADERBOARD_KEY);
  async function point(selector) {
    return evaluate(`(() => {
      const target=document.querySelector(${JSON.stringify(selector)});
      if(!target || target.disabled || target.hidden) throw new Error('Control unavailable: '+${JSON.stringify(selector)});
      target.scrollIntoView({block:'center'});
      const rect=target.getBoundingClientRect();
      const x=rect.x+rect.width/2, y=rect.y+rect.height/2;
      if(!target.contains(document.elementFromPoint(x,y))) throw new Error('Control obscured');
      return {x,y};
    })()`);
  }
  async function mouseAt(position, clickCount = 1) {
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', ...position, button: 'left', clickCount });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...position, button: 'left', clickCount });
  }
  const mouse = async selector => mouseAt(await point(selector));
  async function touchAt(position) {
    await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...position, id: 0 }] });
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  const touch = async selector => touchAt(await point(selector));
  async function key(key, code, windowsVirtualKeyCode) {
    const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, text, unmodifiedText: text });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
  }
  async function snapshot(label) {
    // Capture from the top so off-viewport fixed elements stay outside the image.
    await evaluate('window.scrollTo(0,0)');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${label}: no overflow`);
    const { cssContentSize } = await call('Page.getLayoutMetrics');
    const width = await evaluate('innerWidth');
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: cssContentSize.height, scale: 1 } });
    await writeFile(`.tmp/milestone-6-${label}.png`, Buffer.from(shot.data, 'base64'));
  }
  async function frames(expected) {
    assert.equal(await evaluate('window.__pendingFrames.size'), expected, 'one active clock loop only during a round');
  }
  async function setName(text) {
    await evaluate("document.querySelector('#player-name').focus(); document.querySelector('#player-name').select()");
    await call('Input.insertText', { text });
  }

  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });
  await call('Network.enable');
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Network.setBlockedURLs', { urls: ['*assets/pictures/*'] });
  await call('Page.reload', { ignoreCache: true });
  await waitFor("Boolean(document.querySelector('.preparation-retry'))");
  assert.equal(await evaluate("document.querySelector('.landing .button-primary').disabled"), true);
  assert.match(await evaluate("document.querySelector('#availability').textContent"), /could not load/);
  await snapshot('loading-error-laptop');
  await call('Network.setBlockedURLs', { urls: [] });
  await mouse('.preparation-retry');
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  await frames(0);
  await setName('   '); await key('Tab', 'Tab', 9);
  assert.equal(await evaluate("document.querySelector('#player-name').getAttribute('aria-invalid')"), 'true');
  assert.equal(await evaluate("document.querySelector('.landing .button-primary').disabled"), true);
  await setName('  Mouse   Player  '); await key('Tab', 'Tab', 9);
  assert.equal(await evaluate("document.querySelector('#player-name').value"), 'Mouse Player');
  assert.equal(await evaluate("document.activeElement.matches(':focus-visible') && getComputedStyle(document.activeElement).outlineStyle!=='none'"), true);
  await snapshot('landing-laptop');
  const startPosition = await point('.landing .button-primary');
  await mouseAt(startPosition);
  await mouseAt(startPosition, 2);
  assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), 'Question 1 of 5');
  assert.equal(await evaluate("[...document.querySelectorAll('.image-card')].every(card=>!card.disabled)"), true, 'double-clicking Start must not accidentally answer the newly displayed pair');
  await frames(1);
  console.log('PASS trusted mouse Start, name validation, focus, loading error/Retry, and repeated Start');

  async function round(mode) {
    assert.equal(await evaluate("document.querySelector('.skip-link').textContent"), 'Skip to game');
    const press = mode === 'touch' ? touch : mouse;
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      const audit = await evaluate(`(() => {
        const cards=[...document.querySelectorAll('.image-card')];
        const a=cards[0].getBoundingClientRect(), b=cards[1].getBoundingClientRect();
        return {pair:cards[0].querySelector('img').src.split('/').at(-1).replace('_AI',''), ai:cards.findIndex(card=>card.querySelector('img').src.includes('_AI')), equal:a.width===b.width&&a.height===b.height, neutral:cards.every(card=>/^Choose image [AB]$/.test(card.getAttribute('aria-label'))&&!card.title&&card.querySelector('img').alt===''&&!/AI|Real|webp/.test(card.textContent)), contain:cards.every(card=>getComputedStyle(card.querySelector('img')).objectFit==='contain')};
      })()`);
      assert.equal(audit.equal && audit.neutral && audit.contain, true);
      seen.add(audit.pair);
      if (i === 0) await snapshot(`${mode}-question`);
      const side = i % 2 === 0 ? audit.ai : 1 - audit.ai;
      await press(`.image-card:nth-child(${side + 1})`);
      assert.equal(await evaluate("[...document.querySelectorAll('.image-card')].every(card=>card.disabled)"), true);
      assert.equal(await evaluate("document.activeElement.classList.contains('next-question')"), true);
      assert.equal(await evaluate("document.querySelector('#round-status').textContent"), i % 2 === 0 ? 'YAY! YOU FOUND THE AI!' : 'Oops! This one is a real image.');
      if(i === 1) await snapshot(`${mode}-wrong-feedback`);
      if (i < 4) {
        const previous = await evaluate("document.querySelector('#round-clock').textContent");
        await new Promise(resolve => setTimeout(resolve, 160));
        assert.notEqual(await evaluate("document.querySelector('#round-clock').textContent"), previous);
        assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), `Question ${i+1} of 5`);
        const nextPosition = await point('.next-question');
        await press('.next-question');
        assert.equal(await evaluate("document.querySelector('.skip-link').textContent"), 'Skip to game');
        if (mode === 'mouse') await mouseAt(nextPosition, 2);
        assert.equal(await evaluate("document.querySelector('#question-progress').textContent"), `Question ${i+2} of 5`);
      } else {
        await frames(0);
        const frozen = await evaluate("document.querySelector('#round-clock').textContent");
        await new Promise(resolve => setTimeout(resolve, 160));
        assert.equal(await evaluate("document.querySelector('#round-clock').textContent"), frozen);
        assert.equal(await evaluate(`JSON.parse(localStorage.getItem(${storageKey})).entries.some(entry=>entry.displayName===${JSON.stringify(mode === 'mouse' ? 'Mouse Player' : 'Touch Player')})`), true);
        await press('.next-question');
        assert.equal(await evaluate("document.querySelector('#result-time').textContent"), frozen);
        assert.equal(await evaluate("document.querySelector('.skip-link').textContent"), 'Skip to results');
        assert.equal(await evaluate("document.querySelector('#result-score').textContent"), '3/5');
        await snapshot(`${mode}-results`);
      }
    }
    assert.equal(seen.size, 5);
    console.log(`PASS trusted ${mode} five-question round, both feedback outcomes, manual Next, frozen results, equal contain frames, neutral pre-answer content`);
  }
  await round('mouse');
  await mouse('.result-home');
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
  await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate("[...document.querySelectorAll('.particle')].every(item=>getComputedStyle(item).animationName==='none')"), true);
  await setName('Touch Player');
  await snapshot('landing-narrow-phone');
  const touchStartPosition = await point('.landing .button-primary');
  await touchAt(touchStartPosition);
  await touchAt(touchStartPosition);
  assert.equal(await evaluate("[...document.querySelectorAll('.image-card')].every(card=>!card.disabled)"), true, 'double-tapping Start must not accidentally answer the newly displayed pair');
  await round('touch');
  await touch('.result-leaderboard');
  assert.equal(await evaluate("document.querySelector('.skip-link').textContent"), 'Skip to leaderboard');
  await frames(0);
  await snapshot('leaderboard-narrow-phone');
  await touch('.organizer-controls summary');
  await touch('.clear-leaderboard');
  assert.equal(await evaluate("document.activeElement.classList.contains('cancel-clear')"), true);
  await snapshot('confirmation-narrow-phone');
  await key('Escape', 'Escape', 27);
  assert.equal(await evaluate("document.querySelector('dialog').open"), false);
  assert.equal(await evaluate("document.activeElement.classList.contains('clear-leaderboard')"), true);
  await touch('.leaderboard-back');
  await touch('.play-again');
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  await frames(0);
  assert.equal(await evaluate("document.querySelector('.skip-link').textContent"), 'Skip to name entry');
  assert.equal(await evaluate("document.querySelector('#player-name').value"), 'Touch Player');
  assert.equal(await evaluate("document.querySelector('.comparison').hidden"), true);
  for(let i=0; i<5; i++) {
    await touch('.landing .button-secondary');
    await touch('.leaderboard-back');
  }
  const persistent = await evaluate(`(() => ({
    particles:document.querySelectorAll('.particle').length,
    noninteractive:getComputedStyle(document.querySelector('.ambient')).pointerEvents==='none' && Number(getComputedStyle(document.querySelector('.ambient')).zIndex)<0,
    start:window.__listenerCounts.get(document.querySelector('.landing .button-primary')).click,
    leaderboard:window.__listenerCounts.get(document.querySelector('.landing .button-secondary')).click,
    form:window.__listenerCounts.get(document.querySelector('#name-form')).submit,
    input:window.__listenerCounts.get(document.querySelector('#player-name')).input,
    frames:window.__pendingFrames.size,
    reduced:[...document.querySelectorAll('.particle')].every(item=>getComputedStyle(item).animationName==='none')
  }))()`);
  assert.deepEqual(persistent, {particles:11, noninteractive:true, start:1, leaderboard:1, form:1, input:1, frames:0, reduced:true});
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const animationCount = await evaluate("document.getAnimations().filter(animation=>animation.effect.target.classList.contains('particle')).length");
  assert.ok(animationCount > 0 && animationCount <= 11);
  await touch('.landing .button-primary');
  await frames(1);
  const saved = await evaluate(`localStorage.getItem(${storageKey})`);
  await call('Page.reload', { ignoreCache: true });
  await waitFor("document.querySelector('.landing')?.hidden===false && document.querySelector('#availability')?.textContent.includes('Images ready')");
  await frames(0);
  assert.equal(await evaluate(`localStorage.getItem(${storageKey})`), saved);
  assert.equal(await evaluate("document.querySelector('#player-name').value"), '');
  console.log('PASS touch navigation, Escape/cancel focus, reduced motion, bounded particles/listeners/clock loops, refresh abandons unfinished round without saving');
}
