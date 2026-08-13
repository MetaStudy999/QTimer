import assert from "node:assert/strict";
import {
  createDapchigiSession,
  currentDapchigiQuestionId,
  rateDapchigiQuestion,
  startWeakDapchigiRound,
  getDapchigiRoundSummary,
  getDapchigiHistory
} from "../src/v2/domain/dapchigi-engine.mjs";

let state = createDapchigiSession({ questionIds: ["q1", "q2", "q3", "q4"], scopeKey: "s3:ch02", programId: "program-v2" });
assert.equal(state.status, "active");
assert.equal(state.round, 1);
assert.equal(currentDapchigiQuestionId(state), "q1");

state = rateDapchigiQuestion(state, "O", { ratedAt: "t1" });
assert.equal(currentDapchigiQuestionId(state), "q2");
state = rateDapchigiQuestion(state, "A", { ratedAt: "t2" });
state = rateDapchigiQuestion(state, "X", { ratedAt: "t3" });
state = rateDapchigiQuestion(state, "O", { ratedAt: "t4" });

// End of round must stop instead of silently wrapping to q1.
assert.equal(state.status, "round-complete");
assert.equal(currentDapchigiQuestionId(state), null);
const round1 = getDapchigiRoundSummary(state);
assert.deepEqual(round1.counts, { O: 2, A: 1, X: 1 });
assert.deepEqual(round1.weakIds, ["q2", "q3"]);
assert.equal(round1.completed, true);

const historyBeforeWeak = getDapchigiHistory(state);
assert.equal(historyBeforeWeak.length, 4);

state = startWeakDapchigiRound(state);
assert.equal(state.status, "active");
assert.equal(state.round, 2);
assert.equal(state.roundKind, "weak-ax");
assert.deepEqual(state.activeQuestionIds, ["q2", "q3"]);
assert.equal(currentDapchigiQuestionId(state), "q2");
assert.equal(getDapchigiHistory(state).length, 4, "starting weak round must preserve history");

state = rateDapchigiQuestion(state, "O", { ratedAt: "t5" });
state = rateDapchigiQuestion(state, "O", { ratedAt: "t6" });
assert.equal(state.status, "round-complete");
assert.deepEqual(getDapchigiRoundSummary(state).weakIds, []);
assert.equal(getDapchigiHistory(state).length, 6);

state = startWeakDapchigiRound(state, { startedAt: "done" });
assert.equal(state.status, "complete");
assert.equal(state.completedAt, "done");
assert.equal(state.lastRoundSummary.nextAction, "complete-no-weakness");

// No duplicate rating for the same question in one active round.
let duplicate = createDapchigiSession({ questionIds: ["q1"] });
duplicate = rateDapchigiQuestion(duplicate, "A");
assert.equal(duplicate.status, "round-complete");
assert.throws(() => rateDapchigiQuestion(duplicate, "O"), /not active/);

// Input IDs are deduplicated while preserving order.
const deduped = createDapchigiSession({ questionIds: ["q1", "q1", "q2", "q2"] });
assert.deepEqual(deduped.activeQuestionIds, ["q1", "q2"]);

console.log("# QTimer V2 Dapchigi engine smoke");
console.log("PASS: round completion stops without silent wrap");
console.log("PASS: O/A/X summary and A+X weak compression");
console.log("PASS: historical ratings remain append-only across rounds");
console.log("PASS: weak=0 finishes session explicitly");
