// QTimer V2 Dapchigi domain engine.
// Pure state machine: no DOM, localStorage, timer, renderer, or SOURCE BANK mutation.

export const OAX_RATINGS = Object.freeze(["O", "A", "X"]);
const RATING_SET = new Set(OAX_RATINGS);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function uniqueIds(ids) {
  if (!Array.isArray(ids)) throw new TypeError("questionIds must be an array");
  const result = [];
  const seen = new Set();
  for (const raw of ids) {
    const id = String(raw || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  if (!result.length) throw new TypeError("Dapchigi requires at least one question id");
  return result;
}

function countRatings(entries) {
  const counts = { O: 0, A: 0, X: 0 };
  for (const entry of entries) if (RATING_SET.has(entry.rating)) counts[entry.rating] += 1;
  return counts;
}

function currentRoundRatings(state) {
  return state.ratings.filter(entry => entry.round === state.round && state.activeQuestionIds.includes(entry.questionId));
}

function summarizeRound(state) {
  const entries = currentRoundRatings(state);
  const counts = countRatings(entries);
  const latestById = new Map();
  for (const entry of entries) latestById.set(entry.questionId, entry.rating);
  const weakIds = state.activeQuestionIds.filter(id => ["A", "X"].includes(latestById.get(id)));
  return {
    round: state.round,
    total: state.activeQuestionIds.length,
    rated: latestById.size,
    counts,
    weakIds,
    weakCount: weakIds.length,
    completed: latestById.size === state.activeQuestionIds.length
  };
}

function frozenState(state) {
  return Object.freeze(clone(state));
}

export function createDapchigiSession({ questionIds, scopeKey = "all:all", programId = null, startedAt = null } = {}) {
  const ids = uniqueIds(questionIds);
  return frozenState({
    schemaVersion: 2,
    status: "active",
    scopeKey: String(scopeKey || "all:all"),
    programId: programId ? String(programId) : null,
    sourceQuestionIds: ids,
    activeQuestionIds: ids,
    currentIndex: 0,
    round: 1,
    roundKind: "full",
    ratings: [],
    startedAt: startedAt || null,
    completedAt: null,
    lastRoundSummary: null
  });
}

export function currentDapchigiQuestionId(state) {
  if (!state || state.status !== "active") return null;
  return state.activeQuestionIds[state.currentIndex] || null;
}

export function getDapchigiRoundSummary(state) {
  if (!state || typeof state !== "object") throw new TypeError("Dapchigi state is required");
  return summarizeRound(state);
}

/**
 * Rating is the only operation that advances to the next question.
 * At the final question, the engine stops at `round-complete`; it never silently wraps.
 */
export function rateDapchigiQuestion(stateInput, rating, metadata = {}) {
  const state = clone(stateInput);
  if (!state || state.status !== "active") throw new Error("Dapchigi session is not active");
  const normalized = String(rating || "").toUpperCase();
  if (!RATING_SET.has(normalized)) throw new TypeError(`Unsupported Dapchigi rating: ${rating}`);
  const questionId = state.activeQuestionIds[state.currentIndex];
  if (!questionId) throw new Error("Current Dapchigi question does not exist");

  // A question may only be rated once per round lineage in the active sequence.
  const alreadyRated = state.ratings.some(entry => entry.round === state.round && entry.questionId === questionId);
  if (alreadyRated) throw new Error(`Question ${questionId} is already rated in round ${state.round}`);

  state.ratings.push({
    id: String(metadata.id || `rating-${state.round}-${state.currentIndex + 1}-${questionId}`),
    questionId,
    rating: normalized,
    round: state.round,
    roundKind: state.roundKind,
    assisted: metadata.assisted !== false,
    programId: metadata.programId ? String(metadata.programId) : state.programId,
    ratedAt: metadata.ratedAt || null
  });

  if (state.currentIndex < state.activeQuestionIds.length - 1) {
    state.currentIndex += 1;
    return frozenState(state);
  }

  const summary = summarizeRound(state);
  state.status = "round-complete";
  state.lastRoundSummary = summary;
  return frozenState(state);
}

/**
 * Starts the next round from the most recent completed round's A+X questions.
 * Historical ratings remain append-only.
 */
export function startWeakDapchigiRound(stateInput, { startedAt = null } = {}) {
  const state = clone(stateInput);
  if (!state || state.status !== "round-complete") throw new Error("Weak round can start only after round completion");
  const summary = state.lastRoundSummary || summarizeRound(state);
  if (!summary.completed) throw new Error("Cannot start weak round before every active question is rated");

  if (!summary.weakIds.length) {
    state.status = "complete";
    state.completedAt = startedAt || state.completedAt || null;
    state.lastRoundSummary = { ...summary, nextAction: "complete-no-weakness" };
    return frozenState(state);
  }

  state.round += 1;
  state.roundKind = "weak-ax";
  state.activeQuestionIds = [...summary.weakIds];
  state.currentIndex = 0;
  state.status = "active";
  state.lastRoundSummary = { ...summary, nextAction: "weak-round-started" };
  return frozenState(state);
}

export function finishDapchigiSession(stateInput, { completedAt = null } = {}) {
  const state = clone(stateInput);
  if (!state) throw new TypeError("Dapchigi state is required");
  state.status = "complete";
  state.completedAt = completedAt || state.completedAt || null;
  return frozenState(state);
}

export function getDapchigiHistory(state) {
  if (!state || !Array.isArray(state.ratings)) return [];
  return clone(state.ratings);
}
