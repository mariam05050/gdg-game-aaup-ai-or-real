import test from 'node:test';
import assert from 'node:assert/strict';
import { pairs } from '../src/data/pairs.js';
import { RoundEngine, selectQuestions, formatElapsed } from '../src/game.js';
import { preloadImages } from '../src/preparation.js';

function fixture(options = {}) {
  let timestamp = 100;
  let ids = 0;
  const game = new RoundEngine({
    pool: pairs, preload: async () => {}, random: () => 0.25,
    now: () => timestamp, makeId: () => `round-${++ids}`, ...options,
  });
  return { game, setTime: value => { timestamp = value; } };
}

test('Fisher-Yates selects exactly five unique pairs without changing the verified pool', () => {
  const original = structuredClone(pairs);
  const questions = selectQuestions(pairs, () => 0);
  assert.equal(questions.length, 5);
  assert.equal(new Set(questions.map(question => question.id)).size, 5);
  assert.equal(new Set(questions.flatMap(question => question.images)).size, 10);
  assert.deepEqual(questions.map(question => question.id), pairs.slice(1, 6).map(pair => pair.id));
  assert.deepEqual(pairs, original);
});

test('AI positions are independent draws after the shuffle, with both sides possible', () => {
  const draws = [...Array(14).fill(0.99), 0.1, 0.9, 0.2, 0.8, 0.7];
  const questions = selectQuestions(pairs, () => draws.shift());
  assert.deepEqual(questions.map(question => question.aiIndex), [0, 1, 0, 1, 1]);
  questions.forEach(question => {
    const pair = pairs.find(pair => pair.id === question.id);
    assert.equal(question.images[question.aiIndex], pair.ai);
    assert.equal(question.images[1 - question.aiIndex], pair.real);
  });
  assert.equal(draws.length, 0);
});

test('preparation waits for all ten files and prevents repeated preparation/early Start', async () => {
  let release;
  let references;
  const { game } = fixture({ preload: paths => {
    references = paths;
    return new Promise(resolve => { release = resolve; });
  } });
  const pending = game.prepare();
  assert.equal(game.phase, 'preparing');
  assert.equal(game.start('Mariam'), false);
  assert.equal(await game.prepare(), false);
  assert.equal(references.length, 10);
  assert.equal(new Set(references).size, 10);
  release();
  assert.equal(await pending, true);
  assert.equal(game.phase, 'ready');
});

test('failed image preparation blocks Start and Retry retains the selected pairs', async () => {
  let fail = true;
  const { game } = fixture({ preload: async () => { if (fail) throw new Error('missing'); } });
  assert.equal(await game.prepare(), false);
  assert.equal(game.phase, 'error');
  const selected = game.questions;
  assert.equal(game.start('Mariam'), false);
  fail = false;
  assert.equal(await game.prepare(), true);
  assert.strictEqual(game.questions, selected);
});

test('Start requires a valid name and accepts exactly once with a clean display name', async () => {
  const { game, setTime } = fixture();
  await game.prepare();
  assert.equal(game.start(' \t '), false);
  assert.equal(game.start('x'.repeat(31)), false);
  setTime(500.125);
  assert.equal(game.start('  Mariam   Ali '), true);
  assert.equal(game.playerName, 'Mariam Ali');
  assert.equal(game.startedAt, 500.125);
  setTime(800);
  assert.equal(game.start('Other'), false);
  assert.equal(game.startedAt, 500.125);
  assert.equal(game.playerName, 'Mariam Ali');
});

test('only first answer counts; scoring, invalid input and stale events are guarded', async () => {
  const { game } = fixture();
  await game.prepare(); game.start('Mariam');
  assert.equal(game.answer(0, 2), false);
  assert.equal(game.answer(1, 0), false);
  assert.equal(game.next(0), false);
  assert.equal(game.answer(0, game.questions[0].aiIndex), true);
  assert.equal(game.score, 1);
  assert.equal(game.answer(0, game.questions[0].aiIndex), false);
  assert.equal(game.answer(0, 1 - game.questions[0].aiIndex), false);
  assert.equal(game.score, 1);
  assert.equal(game.next(0), true);
  assert.equal(game.next(0), false);
  assert.equal(game.next(1), false);
  assert.equal(game.index, 1);
  assert.equal(game.answer(0, 0), false);
  assert.equal(game.answer(1, 1 - game.questions[1].aiIndex), true);
  assert.equal(game.score, 1);
  assert.equal(game.next(0), false); // A queued Next from the previous question.
  assert.equal(game.next(1), true);
  assert.equal(game.index, 2);
});

test('elapsed time includes feedback/Next delays and callback-free background time', async () => {
  const { game, setTime } = fixture();
  await game.prepare();
  assert.equal(game.elapsed(), 0);
  game.start('Mariam');
  setTime(1600); game.answer(0, 0);
  setTime(11600); assert.equal(game.elapsed(), 11500);
  game.next(0);
  setTime(90100); // No redraw or timer callbacks occur while time advances.
  assert.equal(game.elapsed(), 90000);
});

test('answer five freezes unrounded time immediately and creates one immutable attempt', async () => {
  const { game, setTime } = fixture();
  await game.prepare(); game.start('Mariam');
  for (let i = 0; i < 4; i++) {
    setTime(1000 + i * 7000);
    game.answer(i, game.questions[i].aiIndex);
    assert.equal(game.completedAttempt, null);
    setTime(6000 + i * 7000); game.next(i);
  }
  setTime(40000.375);
  assert.equal(game.answer(4, 1 - game.questions[4].aiIndex), true);
  const attempt = game.completedAttempt;
  assert.deepEqual(attempt, { roundId: 'round-1', playerName: 'Mariam', score: 4, elapsedMs: 39900.375 });
  assert.equal(Object.isFrozen(attempt), true);
  setTime(999999);
  assert.equal(game.elapsed(), 39900.375);
  assert.equal(game.answer(4, 0), false);
  assert.equal(game.next(4), false);
  assert.equal(game.start('Mariam'), false);
  assert.strictEqual(game.completedAttempt, attempt);
});

test('new rounds have distinct identities and unfinished instances have no attempt', async () => {
  let id = 0;
  const options = { makeId: () => `unique-${++id}` };
  const a = fixture(options).game;
  const b = fixture(options).game;
  await a.prepare(); await b.prepare();
  a.start('Mariam'); b.start('Mariam');
  assert.notEqual(a.roundId, b.roundId);
  a.answer(0, 0);
  assert.equal(a.completedAttempt, null);
  assert.equal(fixture().game.startedAt, null); // Refresh creates a fresh engine.
});

test('elapsed display supports minutes above 59 without altering comparison precision', () => {
  assert.equal(formatElapsed(0), '00:00.00');
  assert.equal(formatElapsed(61234.987), '01:01.23');
  assert.equal(formatElapsed(3600010), '60:00.01');
});

test('image preload resolves base-aware URLs and waits for every decode', async () => {
  const paths = selectQuestions(pairs, () => 0).flatMap(question => question.images);
  const releases = [];
  const created = [];
  let finished = false;
  const pending = preloadImages(paths, {
    resolveUrl: path => `/repository/${path}`,
    createImage: () => {
      const image = { naturalWidth: 640, naturalHeight: 480,
        decode: () => new Promise(resolve => releases.push(resolve)) };
      created.push(image); return image;
    },
  }).then(result => { finished = true; return result; });
  assert.equal(created.length, 10);
  releases.slice(0, 9).forEach(resolve => resolve());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  releases[9]();
  const decoded = await pending;
  assert.equal(decoded.size, 10);
  created.forEach((image, index) => assert.equal(image.src, `/repository/${paths[index]}`));
});

test('preload errors, invalid dimensions and timeouts reject preparation', async () => {
  const options = { resolveUrl: path => path };
  await assert.rejects(preloadImages(['missing.webp'], { ...options,
    createImage: () => ({ decode: async () => { throw new Error('missing'); } }) }));
  await assert.rejects(preloadImages(['empty.webp'], { ...options,
    createImage: () => ({ naturalWidth: 0, naturalHeight: 0, decode: async () => {} }) }));
  await assert.rejects(preloadImages(['timeout.webp'], { ...options, timeoutMs: 1,
    createImage: () => ({ decode: () => new Promise(() => {}) }) }), /timed out/);
});
