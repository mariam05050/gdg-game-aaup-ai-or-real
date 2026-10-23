import { cleanName, NAME_LIMIT } from './name.js';

export const ROUND_LENGTH = 5;

export function selectQuestions(pool, random = Math.random) {
  if (pool.length < ROUND_LENGTH || new Set(pool.map(pair => pair.id)).size !== pool.length) {
    throw new Error('A round needs at least five uniquely identified pairs.');
  }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROUND_LENGTH).map(pair => {
    const aiIndex = random() < 0.5 ? 0 : 1;
    return Object.freeze({
      id: pair.id,
      aiIndex,
      images: Object.freeze(aiIndex === 0 ? [pair.ai, pair.real] : [pair.real, pair.ai]),
    });
  });
}

export function formatElapsed(milliseconds) {
  const hundredths = Math.floor(Math.max(0, milliseconds) / 10);
  return `${String(Math.floor(hundredths / 6000)).padStart(2, '0')}:${String(Math.floor(hundredths / 100) % 60).padStart(2, '0')}.${String(hundredths % 100).padStart(2, '0')}`;
}

// No storage or rendering here. A new instance represents a new, unsaved round.
export class RoundEngine {
  constructor({ pool, preload, random = Math.random, now = () => performance.now(), makeId = () => crypto.randomUUID() }) {
    this.pool = pool;
    this.preload = preload;
    this.random = random;
    this.now = now;
    this.makeId = makeId;
    this.phase = 'idle';
    this.questions = [];
    this.index = 0;
    this.score = 0;
    this.startedAt = null;
    this.completedAttempt = null;
    this.selectedIndex = null;
  }

  async prepare() {
    if (!['idle', 'error'].includes(this.phase)) return false;
    this.phase = 'preparing';
    try {
      // Retry the same ten files; never hide a missing asset by substituting pairs.
      if (!this.questions.length) this.questions = selectQuestions(this.pool, this.random);
      await this.preload(this.questions.flatMap(question => question.images));
      this.phase = 'ready';
      return true;
    } catch {
      this.phase = 'error';
      return false;
    }
  }

  start(name) {
    const playerName = cleanName(name);
    if (this.phase !== 'ready' || !playerName || Array.from(playerName).length > NAME_LIMIT) return false;
    this.roundId = this.makeId();
    this.playerName = playerName;
    this.startedAt = this.now();
    this.phase = 'awaiting';
    return true;
  }

  elapsed() {
    if (this.completedAttempt) return this.completedAttempt.elapsedMs;
    return this.startedAt === null ? 0 : Math.max(0, this.now() - this.startedAt);
  }

  answer(questionIndex, imageIndex) {
    if (this.phase !== 'awaiting' || questionIndex !== this.index || ![0, 1].includes(imageIndex)) return false;
    this.phase = 'feedback'; // Lock synchronously before scoring or any caller rendering.
    const acceptedAt = this.now();
    this.selectedIndex = imageIndex;
    const correct = imageIndex === this.questions[this.index].aiIndex;
    if (correct) this.score++;
    if (this.index === ROUND_LENGTH - 1) {
      this.completedAttempt = Object.freeze({
        roundId: this.roundId,
        playerName: this.playerName,
        score: this.score,
        elapsedMs: Math.max(0, acceptedAt - this.startedAt),
      });
      this.phase = 'complete';
    }
    return true;
  }

  next(questionIndex) {
    if (this.phase !== 'feedback' || questionIndex !== this.index) return false;
    this.index++;
    this.selectedIndex = null;
    this.phase = 'awaiting';
    return true;
  }
}
