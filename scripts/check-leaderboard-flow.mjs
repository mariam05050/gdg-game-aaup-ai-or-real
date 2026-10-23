import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { LEADERBOARD_KEY } from '../src/leaderboard.js';

// Invoked only inside the isolated profile/origin created by check-round-flow.
export async function checkLeaderboardFlow({ call, evaluate, waitFor }) {
  const key = JSON.stringify(LEADERBOARD_KEY);
  const board = () => evaluate("document.querySelector('.landing .button-secondary').click()");
  const back = () => evaluate("document.querySelector('.leaderboard-back').click()");
  const askClear = () => evaluate("document.querySelector('.organizer-controls').open=true; document.querySelector('.clear-leaderboard').click()");
  const clear = () => evaluate("document.querySelector('.confirm-clear').click()");
  await board();
  const original = await evaluate(`localStorage.getItem(${key})`);
  await askClear();
  assert.equal(await evaluate("document.querySelector('dialog').open"), true);
  await evaluate("document.querySelector('.cancel-clear').click()");
  assert.equal(await evaluate(`localStorage.getItem(${key})`), original);
  await evaluate(`window.__remove = Storage.prototype.removeItem; Storage.prototype.removeItem = function(key) { if(key === ${key}) throw new Error('denied'); return window.__remove.call(this,key); };`);
  await askClear(); await clear();
  assert.match(await evaluate("document.querySelector('.leaderboard-message').textContent"), /could not be cleared/);
  assert.equal(await evaluate(`localStorage.getItem(${key})`), original);
  await evaluate('Storage.prototype.removeItem = window.__remove');
  await askClear(); await clear();
  assert.equal(await evaluate(`localStorage.getItem(${key})`), null);
  assert.equal(await evaluate("document.querySelector('.leaderboard-empty').hidden"), false);
  assert.equal(await evaluate("localStorage.getItem('unrelated-test-data')"), 'preserve');
  await back();
  assert.equal(await evaluate("document.querySelector('.landing').hidden"), false);
  console.log('PASS clear confirmation/cancellation, deletion failure, empty state, unrelated storage preserved, Back to landing');

  // Deliberately seed tied test scores, including a literal markup-like name.
  const names = ['Ada', 'Bea', 'Cora', 'Dana', 'Eva', 'Fay', '<img src=x onerror=alert(1)>'];
  const scores = [5, 4, 4, 3, 2, 2, 1];
  const times = [1000, 2000, 2000, 3000, 4000, 4000, 5000];
  const entries = names.map((name, index) => ({ nameKey: name.toLowerCase(), displayName: name,
    score: scores[index], elapsedMs: times[index], savedAt: index, roundId: `fixture-${index}` }));
  await evaluate(`localStorage.setItem(${key}, ${JSON.stringify(JSON.stringify({ version: 1, entries }))})`);
  await board();
  assert.deepEqual(await evaluate("[...document.querySelectorAll('tbody tr')].map(row=>Number(row.children[0].textContent))"), [1, 2, 2, 4, 5, 5, 7]);
  assert.equal(await evaluate("document.querySelectorAll('.leading-rank').length"), 6);
  assert.equal(await evaluate("document.querySelectorAll('tbody img').length"), 0);
  assert.equal(await evaluate("document.querySelector('tbody tr:last-child td:nth-child(2)').textContent"), names.at(-1));
  for (const [label, width, height] of [['laptop', 1440, 960], ['narrow-phone', 320, 740]]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    const { cssContentSize } = await call('Page.getLayoutMetrics');
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: Math.max(height, cssContentSize.height), scale: 1 } });
    await writeFile(`.tmp/milestone-5-leaderboard-${label}.png`, Buffer.from(shot.data, 'base64'));
  }
  await call('Page.reload', { ignoreCache: true });
  await waitFor("document.querySelector('.landing')?.hidden === false && document.querySelector('#availability')?.textContent.includes('Images ready')");
  await board();
  assert.equal(await evaluate("document.querySelectorAll('tbody tr').length"), 7);
  console.log('PASS refresh persistence, shared competition ranks, fifth-place ties, all remaining rows, literal text names, laptop/phone layout');
  await askClear(); await clear(); await back();

  await evaluate(`window.__get = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { if(key === ${key}) throw new Error('denied'); return window.__get.call(this,key); };`);
  await board();
  assert.match(await evaluate("document.querySelector('.leaderboard-message').textContent"), /could not be read/);
  assert.equal(await evaluate("document.querySelector('.leaderboard-empty').hidden"), true);
  await back();
  await evaluate('Storage.prototype.getItem = window.__get');

  async function fastRound(name) {
    await evaluate(`(() => { const input = document.querySelector('#player-name'); input.value=${JSON.stringify(name)}; input.dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('.landing .button-primary').click(); })()`);
    await evaluate(`(() => { for(let index=0; index<5; index++) { const cards=[...document.querySelectorAll('.image-card')]; cards.find(card=>card.querySelector('img').src.includes('_AI')).click(); if(index<4) document.querySelector('.next-question').click(); } document.querySelector('.next-question').click(); })()`);
    assert.equal(await evaluate("document.querySelector('#result-score').textContent"), '5/5');
    assert.match(await evaluate("document.querySelector('#result-availability').textContent"), /could not be saved/);
  }
  await evaluate(`localStorage.setItem(${key}, '{broken')`);
  await fastRound('Malformed test');
  assert.equal(await evaluate(`localStorage.getItem(${key})`), '{broken');
  await evaluate("document.querySelector('.result-leaderboard').click()");
  assert.match(await evaluate("document.querySelector('.leaderboard-message').textContent"), /unreadable data/);
  await askClear(); await clear(); await back();
  assert.match(await evaluate("document.querySelector('#result-availability').textContent"), /could not be saved/);
  await evaluate("document.querySelector('.result-home').click()");
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  await evaluate(`window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function(key,value) { if(key === ${key}) throw new Error('quota'); return window.__set.call(this,key,value); };`);
  await fastRound('Write failure');
  assert.equal(await evaluate(`localStorage.getItem(${key})`), null);
  await evaluate('Storage.prototype.setItem = window.__set');
  await evaluate("document.querySelector('.result-home').click()");
  await waitFor("document.querySelector('#availability').textContent.includes('Images ready')");
  assert.equal(await evaluate("localStorage.getItem('unrelated-test-data')"), 'preserve');
  console.log('PASS read/parse/write/remove errors reported honestly, malformed data preserved, gameplay stays usable through failures');
}
