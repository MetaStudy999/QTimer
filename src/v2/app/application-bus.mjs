// QTimer V2 Application Bus.
// Replaces cross-feature global function wrapping with explicit command and event contracts.

const NAME_PATTERN = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;

function normalizeName(name, kind) {
  const value = String(name || "").trim();
  if (!NAME_PATTERN.test(value)) throw new TypeError(`Invalid ${kind} name: ${value || "<missing>"}`);
  return value;
}

function clone(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}

export function createEventBus() {
  const listeners = new Map();

  function on(nameInput, listener, { once = false } = {}) {
    const name = normalizeName(nameInput, "event");
    if (typeof listener !== "function") throw new TypeError(`Listener for ${name} must be a function`);
    const record = { listener, once: Boolean(once) };
    const set = listeners.get(name) || new Set();
    set.add(record);
    listeners.set(name, set);
    return () => {
      set.delete(record);
      if (!set.size) listeners.delete(name);
    };
  }

  function emit(nameInput, payload = null, metadata = {}) {
    const name = normalizeName(nameInput, "event");
    const event = Object.freeze({
      name,
      payload: clone(payload),
      metadata: clone(metadata),
      emittedAt: metadata.emittedAt || null
    });
    const set = listeners.get(name);
    if (!set?.size) return { delivered: 0, event };

    const errors = [];
    let delivered = 0;
    for (const record of [...set]) {
      try {
        record.listener(event);
        delivered += 1;
      } catch (error) {
        errors.push(error);
      } finally {
        if (record.once) set.delete(record);
      }
    }
    if (!set.size) listeners.delete(name);
    if (errors.length) throw new AggregateError(errors, `Event ${name} failed in ${errors.length} listener(s)`);
    return { delivered, event };
  }

  function clear(nameInput = null) {
    if (nameInput == null) listeners.clear();
    else listeners.delete(normalizeName(nameInput, "event"));
  }

  return Object.freeze({ on, once: (name, listener) => on(name, listener, { once: true }), emit, clear });
}

export function createCommandBus() {
  const handlers = new Map();

  function register(nameInput, handler) {
    const name = normalizeName(nameInput, "command");
    if (typeof handler !== "function") throw new TypeError(`Handler for ${name} must be a function`);
    if (handlers.has(name)) throw new Error(`Command already has a handler: ${name}`);
    handlers.set(name, handler);
    return () => handlers.delete(name);
  }

  function execute(nameInput, payload = null, context = {}) {
    const name = normalizeName(nameInput, "command");
    const handler = handlers.get(name);
    if (!handler) throw new Error(`No handler registered for command: ${name}`);
    return handler(clone(payload), Object.freeze(clone(context || {})));
  }

  function has(nameInput) {
    return handlers.has(normalizeName(nameInput, "command"));
  }

  return Object.freeze({ register, execute, has });
}

export const QTIMER_V2_COMMANDS = Object.freeze({
  STUDY_START: "study/start",
  STUDY_SUBMIT: "study/submit",
  STUDY_RATE: "study/rate",
  FORMAT_UPDATE: "format/update",
  TRANSFORM_UPDATE: "transform/update",
  PROGRAM_START: "program/start",
  PREFERENCES_UPDATE: "preferences/update",
  BACKUP_PREPARE: "backup/prepare",
  BACKUP_COMMIT: "backup/commit"
});

export const QTIMER_V2_EVENTS = Object.freeze({
  STUDY_SESSION_STARTED: "study/session-started",
  STUDY_QUESTION_CHANGED: "study/question-changed",
  STUDY_ATTEMPT_RECORDED: "study/attempt-recorded",
  STUDY_RATING_RECORDED: "study/rating-recorded",
  STUDY_ROUND_COMPLETED: "study/round-completed",
  FORMAT_CHANGED: "format/changed",
  TRANSFORM_CHANGED: "transform/changed",
  PROGRAM_STEP_CHANGED: "program/step-changed",
  PREFERENCES_CHANGED: "preferences/changed",
  STORAGE_IMPORTED: "storage/imported",
  STORAGE_IMPORT_ROLLED_BACK: "storage/import-rolled-back"
});
