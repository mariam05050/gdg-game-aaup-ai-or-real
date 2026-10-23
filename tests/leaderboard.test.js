import test from 'node:test';
import assert from 'node:assert/strict';
import { createLeaderboard, LEADERBOARD_KEY, normalizeName, rankEntries } from '../src/leaderboard.js';
import { RoundEngine } from '../src/game.js';
import { pairs } from '../src/data/pairs.js';

function fixture() {
  const data = new Map();
  let writes = 0;
  let timestamp = 1000;
  const failures = {};
  const storage = {
    getItem(key) { if (failures.read) throw new Error('read denied'); return data.get(key) ?? null; },
    setItem(key, value) { if (failures.write) throw new Error('quota'); writes++; data.set(key, value); },
    removeItem(key) { if (failures.remove) throw new Error('remove denied'); data.delete(key); },
  };
  const options = { getStorage: () => storage, now: () => timestamp++ };
  return { data, failures, options, store: createLeaderboard(options), writes: () => writes };
}
let nextId = 0;
const attempt = (playerName = 'Mariam', score = 3, elapsedMs = 40000) => ({ playerName, score, elapsedMs, roundId: `round-${++nextId}` });

test('completed result uses stable key and versioned data with cleaned display name', () => {
  const { store, data } = fixture();
  assert.equal(store.saveCompletedAttempt(attempt('  Mariam   Ali  ')).status, 'new-best');
  const saved = JSON.parse(data.get(LEADERBOARD_KEY));
  assert.equal(saved.version, 1);
  assert.deepEqual(saved.entries[0], { nameKey: 'mariam ali', displayName: 'Mariam Ali', score: 3, elapsedMs: 40000, savedAt: 1000, roundId: saved.entries[0].roundId });
});

test('Unicode, case, and whitespace variants share one best while preserving display text', () => {
  const { store } = fixture();
  store.saveCompletedAttempt(attempt('  JOSE\u0301   Ali  ', 3));
  store.saveCompletedAttempt(attempt('josé ali', 4));
  assert.equal(store.read().entries.length, 1);
  assert.equal(store.read().entries[0].displayName, 'josé ali');
  assert.equal(normalizeName('  مريم   أحمد  '), 'مريم أحمد');
  assert.equal(normalizeName(' Jose\u0301 '), normalizeName('JOSÉ'));
});

test('higher score replaces a faster lower score; lower score never replaces best', () => {
  const { store, data } = fixture();
  store.saveCompletedAttempt(attempt('Mariam', 4, 30000));
  assert.equal(store.saveCompletedAttempt(attempt('mariam', 5, 80000)).status, 'new-best');
  const raw = data.get(LEADERBOARD_KEY);
  assert.equal(store.saveCompletedAttempt(attempt(' MARIAM ', 4, 20000)).status, 'existing-best');
  assert.equal(data.get(LEADERBOARD_KEY), raw);
});

test('equal score uses unrounded time; equal and slower attempts preserve original entry', () => {
  const { store, data, writes } = fixture();
  store.saveCompletedAttempt(attempt('Mariam', 5, 70000.125));
  assert.equal(store.saveCompletedAttempt(attempt('mariam', 5, 70000.124)).status, 'new-best');
  const raw = data.get(LEADERBOARD_KEY);
  const count = writes();
  assert.equal(store.saveCompletedAttempt(attempt('MARIAM', 5, 70000.124)).status, 'existing-best');
  assert.equal(store.saveCompletedAttempt(attempt('Mariam', 5, 70000.126)).status, 'existing-best');
  assert.equal(writes(), count);
  assert.equal(data.get(LEADERBOARD_KEY), raw);
});

test('repeated completion is processed once, even if passed a changed payload', () => {
  const { store, writes } = fixture();
  const result = attempt();
  const outcome = store.saveCompletedAttempt(result);
  assert.strictEqual(store.saveCompletedAttempt({ ...result, score: 5 }), outcome);
  assert.equal(writes(), 1);
  assert.equal(store.read().entries[0].score, 3);
});

test('fresh service reads persisted best and does not write the same round twice', () => {
  const { store, options, writes } = fixture();
  const result = attempt(); store.saveCompletedAttempt(result);
  const reopened = createLeaderboard(options);
  assert.equal(reopened.read().entries[0].elapsedMs, result.elapsedMs);
  assert.equal(reopened.saveCompletedAttempt(result).status, 'existing-best');
  assert.equal(writes(), 1);
});

test('competition ranks, timestamp/name ordering, and all fifth-place ties are retained', () => {
  const records = [
    ['a', 5, 100, 1], ['c', 4, 200, 2], ['b', 4, 200, 2],
    ['d', 3, 300, 3], ['f', 2, 400, 2], ['e', 2, 400, 1], ['g', 1, 100, 1],
  ].map(([nameKey, score, elapsedMs, savedAt]) => ({ nameKey, score, elapsedMs, savedAt }));
  const original = structuredClone(records);
  const ranked = rankEntries(records);
  assert.deepEqual(ranked.map(row => row.rank), [1, 2, 2, 4, 5, 5, 7]);
  assert.deepEqual(ranked.map(row => row.nameKey), ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  assert.deepEqual(ranked.map(row => row.highlighted), [true, true, true, true, true, true, false]);
  assert.deepEqual(records, original);
});

test('read access failures block writes and are reported honestly', () => {
  const { store, failures, writes } = fixture();
  failures.read = true;
  assert.equal(store.read().ok, false);
  assert.equal(store.saveCompletedAttempt(attempt()).status, 'error');
  assert.equal(writes(), 0);
  const denied = createLeaderboard({ getStorage: () => { throw new Error('SecurityError'); } });
  assert.equal(denied.read().ok, false);
  assert.equal(denied.saveCompletedAttempt(attempt()).status, 'error');
  assert.equal(denied.clear().ok, false);
});

test('malformed, unsupported and invalid saved data is preserved without overwriting', () => {
  const { store, data, writes } = fixture();
  const raws = ['{broken', 'null', '{}', '{"version":2,"entries":[]}',
    '{"version":1,"entries":[{"score":9}]}'];
  for (const raw of raws) {
    data.set(LEADERBOARD_KEY, raw);
    assert.equal(store.read().ok, false);
    assert.equal(store.saveCompletedAttempt(attempt()).status, 'error');
    assert.equal(data.get(LEADERBOARD_KEY), raw);
  }
  assert.equal(writes(), 0);
});

test('invalid entry fields and duplicate normalized names are rejected as a whole', () => {
  const { store, data } = fixture();
  store.saveCompletedAttempt(attempt());
  const entry = store.read().entries[0];
  const invalidEntries = [
    { ...entry, elapsedMs: -1 }, { ...entry, score: 1.5 }, { ...entry, savedAt: -1 },
    { ...entry, nameKey: 'WRONG' }, { ...entry, displayName: '  Mariam ' },
    { ...entry, roundId: '' }, { ...entry, displayName: 'x'.repeat(31) },
  ];
  for (const invalid of invalidEntries) {
    data.set(LEADERBOARD_KEY, JSON.stringify({ version: 1, entries: [invalid] }));
    assert.equal(store.read().ok, false);
  }
  data.set(LEADERBOARD_KEY, JSON.stringify({ version: 1, entries: [entry, entry] }));
  assert.equal(store.read().ok, false);
});

test('write failures never claim new-best success or destroy a previous best', () => {
  const { store, failures, data } = fixture();
  store.saveCompletedAttempt(attempt('Mariam', 3));
  const raw = data.get(LEADERBOARD_KEY);
  failures.write = true;
  assert.equal(store.saveCompletedAttempt(attempt('Mariam', 5)).status, 'error');
  assert.equal(data.get(LEADERBOARD_KEY), raw);
});

test('clear removes only game key; failed deletion retains data and reports failure', () => {
  const { store, data, failures } = fixture();
  data.set('unrelated', 'preserve');
  store.saveCompletedAttempt(attempt());
  failures.remove = true;
  assert.equal(store.clear().ok, false);
  assert.equal(store.read().entries.length, 1);
  failures.remove = false;
  assert.equal(store.clear().ok, true);
  assert.equal(data.has(LEADERBOARD_KEY), false);
  assert.equal(data.get('unrelated'), 'preserve');
  assert.deepEqual(store.read(), { ok: true, entries: [] });
});

test('invalid attempt payloads never write or create a best', () => {
  const { store, writes } = fixture();
  for (const invalid of [null, {}, { ...attempt(), playerName: ' ' }, { ...attempt(), score: 6 },
    { ...attempt(), score: 2.5 }, { ...attempt(), elapsedMs: Infinity }, { ...attempt(), elapsedMs: -1 }]) {
    assert.equal(store.saveCompletedAttempt(invalid).status, 'error');
  }
  assert.equal(writes(), 0);
});

test('engine completion can be saved at answer five without View Results; incomplete round has no save', async () => {
  const { store, writes } = fixture();
  let clock = 0;
  const game = new RoundEngine({ pool: pairs, preload: async () => {}, random: () => 0.25,
    now: () => clock, makeId: () => 'completed-round' });
  await game.prepare(); game.start('Mariam');
  for (let index = 0; index < 5; index++) {
    clock += 123.456;
    game.answer(index, 0);
    if (game.completedAttempt) store.saveCompletedAttempt(game.completedAttempt);
    assert.equal(writes(), index < 4 ? 0 : 1);
    if (index < 4) game.next(index);
  }
  assert.equal(store.read().entries[0].elapsedMs, game.completedAttempt.elapsedMs);
  store.saveCompletedAttempt(game.completedAttempt);
  assert.equal(writes(), 1);
});
