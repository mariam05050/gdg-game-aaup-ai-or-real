import { cleanName, NAME_LIMIT } from './name.js';

export const LEADERBOARD_KEY = 'gdg-aaup:ai-or-real:leaderboard:v1';
export const LEADERBOARD_VERSION = 1;
export const normalizeName = name => cleanName(name).toLowerCase().normalize('NFC');
const validNumber = value => Number.isFinite(value) && value >= 0;
const validName = value => typeof value === 'string' && !!cleanName(value) && Array.from(cleanName(value)).length <= NAME_LIMIT;
const validScore = score => Number.isInteger(score) && score >= 0 && score <= 5;

export function isBetter(attempt, best) {
  return attempt.score > best.score || (attempt.score === best.score && attempt.elapsedMs < best.elapsedMs);
}

export function rankEntries(entries) {
  const sorted = [...entries].sort((a, b) => b.score - a.score || a.elapsedMs - b.elapsedMs ||
    a.savedAt - b.savedAt || (a.nameKey < b.nameKey ? -1 : a.nameKey > b.nameKey ? 1 : 0));
  let rank = 0;
  return sorted.map((entry, index) => {
    const previous = sorted[index - 1];
    if (!previous || previous.score !== entry.score || previous.elapsedMs !== entry.elapsedMs) rank = index + 1;
    return { ...entry, rank, highlighted: rank <= 5 };
  });
}

function validateData(data) {
  if (!data || data.version !== LEADERBOARD_VERSION || !Array.isArray(data.entries)) return false;
  const keys = new Set();
  return data.entries.every(entry => {
    if (!entry || !validName(entry.displayName) || cleanName(entry.displayName) !== entry.displayName ||
      entry.nameKey !== normalizeName(entry.displayName) || keys.has(entry.nameKey) ||
      !validScore(entry.score) || !validNumber(entry.elapsedMs) || !validNumber(entry.savedAt) ||
      typeof entry.roundId !== 'string' || !entry.roundId) return false;
    keys.add(entry.nameKey);
    return true;
  });
}

export function createLeaderboard({ getStorage = () => globalThis.localStorage, now = Date.now } = {}) {
  const processedRounds = new Map();
  function read() {
    let raw;
    try { raw = getStorage().getItem(LEADERBOARD_KEY); }
    catch { return { ok: false, entries: [], message: 'Saved scores could not be read on this browser.' }; }
    if (raw === null) return { ok: true, entries: [] };
    let data;
    try { data = JSON.parse(raw); }
    catch { return { ok: false, entries: [], message: 'Saved scores contain unreadable data. The original data was not changed.' }; }
    if (!validateData(data)) return { ok: false, entries: [], message: 'Saved scores have an unsupported or invalid format. The original data was not changed.' };
    return { ok: true, entries: data.entries };
  }

  function saveCompletedAttempt(attempt) {
    if (!attempt || typeof attempt.roundId !== 'string' || !attempt.roundId || !validName(attempt.playerName) ||
      !validScore(attempt.score) || !validNumber(attempt.elapsedMs)) {
      return { status: 'error', message: 'The completed result is invalid and could not be saved.' };
    }
    if (processedRounds.has(attempt.roundId)) return processedRounds.get(attempt.roundId);
    let outcome;
    const existing = read();
    if (!existing.ok) outcome = { status: 'error', message: existing.message };
    else {
      const nameKey = normalizeName(attempt.playerName);
      const best = existing.entries.find(entry => entry.nameKey === nameKey);
      if (best && (best.roundId === attempt.roundId || !isBetter(attempt, best))) {
        outcome = { status: 'existing-best', best };
      } else {
        const entry = { nameKey, displayName: cleanName(attempt.playerName), score: attempt.score,
          elapsedMs: attempt.elapsedMs, savedAt: now(), roundId: attempt.roundId };
        try {
          if (!validNumber(entry.savedAt)) throw new Error('Invalid timestamp');
          getStorage().setItem(LEADERBOARD_KEY, JSON.stringify({ version: LEADERBOARD_VERSION,
            entries: [...existing.entries.filter(item => item.nameKey !== nameKey), entry] }));
          outcome = { status: 'new-best', best: entry };
        } catch { outcome = { status: 'error', message: 'This result could not be written to browser storage.' }; }
      }
    }
    processedRounds.set(attempt.roundId, outcome);
    return outcome;
  }

  function clear() {
    try { getStorage().removeItem(LEADERBOARD_KEY); return { ok: true }; }
    catch { return { ok: false, message: 'Saved scores could not be cleared on this browser. Please try again.' }; }
  }
  return { read, saveCompletedAttempt, clear };
}
