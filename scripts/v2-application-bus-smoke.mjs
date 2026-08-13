import assert from "node:assert/strict";
import { createEventBus, createCommandBus, QTIMER_V2_COMMANDS, QTIMER_V2_EVENTS } from "../src/v2/app/application-bus.mjs";

const events = createEventBus();
const seen = [];
const unsubscribe = events.on(QTIMER_V2_EVENTS.STUDY_QUESTION_CHANGED, event => seen.push(event));
const onceSeen = [];
events.once(QTIMER_V2_EVENTS.STUDY_QUESTION_CHANGED, event => onceSeen.push(event.payload.questionId));

const emitted = events.emit(QTIMER_V2_EVENTS.STUDY_QUESTION_CHANGED, { questionId: "q1" }, { emittedAt: "t1" });
assert.equal(emitted.delivered, 2);
assert.equal(seen[0].payload.questionId, "q1");
assert.equal(seen[0].metadata.emittedAt, "t1");

// Payload is cloned before delivery; mutating the original object later does not mutate the event.
const original = { questionId: "q2", nested: { value: 1 } };
events.emit(QTIMER_V2_EVENTS.STUDY_QUESTION_CHANGED, original);
original.nested.value = 99;
assert.equal(seen[1].payload.nested.value, 1);
assert.deepEqual(onceSeen, ["q1"]);
unsubscribe();
events.emit(QTIMER_V2_EVENTS.STUDY_QUESTION_CHANGED, { questionId: "q3" });
assert.equal(seen.length, 2);

const commands = createCommandBus();
let commandPayload = null;
commands.register(QTIMER_V2_COMMANDS.STUDY_RATE, (payload, context) => {
  commandPayload = { payload, context };
  return { accepted: true, rating: payload.rating };
});
assert.equal(commands.has(QTIMER_V2_COMMANDS.STUDY_RATE), true);
const commandResult = commands.execute(QTIMER_V2_COMMANDS.STUDY_RATE, { rating: "A" }, { source: "keyboard" });
assert.deepEqual(commandResult, { accepted: true, rating: "A" });
assert.deepEqual(commandPayload, { payload: { rating: "A" }, context: { source: "keyboard" } });
assert.throws(() => commands.register(QTIMER_V2_COMMANDS.STUDY_RATE, () => {}), /already has a handler/);
assert.throws(() => commands.execute("unknown/command"), /No handler registered/);
assert.throws(() => events.emit("bad name"), /Invalid event name/);

console.log("# QTimer V2 application bus smoke");
console.log("PASS: explicit event subscriptions replace global renderer wrappers");
console.log("PASS: once/unsubscribe lifecycle works");
console.log("PASS: commands have one explicit handler and cloned payload/context");
console.log("PASS: invalid event/command contracts fail fast");
