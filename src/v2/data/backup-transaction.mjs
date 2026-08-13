// QTimer V2 Backup import transaction.
// Pure adapter contract around a Storage-like interface: getItem/setItem/removeItem.

const DEFAULT_LIMITS = Object.freeze({
  maxBytes: 10 * 1024 * 1024,
  maxDepth: 40,
  maxNodes: 200000,
  maxModules: 50
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function byteLength(text) {
  return new TextEncoder().encode(String(text)).byteLength;
}

function measureStructure(root, limits) {
  let nodes = 0;
  const stack = [{ value: root, depth: 0 }];
  while (stack.length) {
    const { value, depth } = stack.pop();
    nodes += 1;
    if (nodes > limits.maxNodes) throw new RangeError(`Backup JSON exceeds node limit ${limits.maxNodes}`);
    if (depth > limits.maxDepth) throw new RangeError(`Backup JSON exceeds depth limit ${limits.maxDepth}`);
    if (!value || typeof value !== "object") continue;
    if (Array.isArray(value)) {
      for (const item of value) stack.push({ value: item, depth: depth + 1 });
    } else {
      for (const item of Object.values(value)) stack.push({ value: item, depth: depth + 1 });
    }
  }
  return nodes;
}

export function parseBackupText(text, limitsInput = {}) {
  const limits = { ...DEFAULT_LIMITS, ...limitsInput };
  if (typeof text !== "string") throw new TypeError("Backup content must be text");
  const bytes = byteLength(text);
  if (bytes > limits.maxBytes) throw new RangeError(`Backup file is too large: ${bytes} bytes`);
  let payload;
  try { payload = JSON.parse(text); }
  catch (error) { throw new SyntaxError(`Backup JSON parse failed: ${error.message}`); }
  const nodes = measureStructure(payload, limits);
  return { payload, bytes, nodes, limits };
}

export function prepareBackupImport(text, registry, options = {}) {
  if (!registry || typeof registry.prepareImport !== "function") throw new TypeError("StorageRegistry is required");
  const parsed = parseBackupText(text, options);
  const plan = registry.prepareImport(parsed.payload, {
    rejectUnknown: options.rejectUnknown !== false,
    maxModules: options.maxModules ?? parsed.limits.maxModules
  });
  return Object.freeze({ ...plan, sourceBytes: parsed.bytes, sourceNodes: parsed.nodes });
}

function requireStorage(storage) {
  for (const method of ["getItem", "setItem", "removeItem"]) {
    if (!storage || typeof storage[method] !== "function") throw new TypeError(`Storage adapter requires ${method}()`);
  }
}

function snapshotKeys(storage, keys) {
  const entries = {};
  for (const key of keys) entries[key] = storage.getItem(key);
  return entries;
}

function restoreSnapshot(storage, snapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, value);
  }
}

function readSnapshot(storage, snapshotKey) {
  const snapshotRaw = storage.getItem(snapshotKey);
  if (!snapshotRaw) return null;
  let snapshot;
  try { snapshot = JSON.parse(snapshotRaw); }
  catch { throw new Error("Pre-import snapshot is corrupted"); }
  if (!snapshot || typeof snapshot !== "object" || !snapshot.entries || typeof snapshot.entries !== "object" || Array.isArray(snapshot.entries)) {
    throw new Error("Pre-import snapshot has invalid shape");
  }
  return snapshot;
}

/**
 * Commits an already validated import plan.
 * No validation/migration is performed after the first persistent write.
 */
export function commitImportPlan(plan, storage, options = {}) {
  requireStorage(storage);
  if (!plan || !Array.isArray(plan.writes)) throw new TypeError("Prepared import plan is required");

  const stagingKey = String(options.stagingKey || "qtimer.v2.import-staging");
  const snapshotKey = String(options.snapshotKey || "qtimer.v2.preimport-snapshot");
  const writeKeys = [...new Set(plan.writes.map(write => String(write.storageKey)))];
  if (writeKeys.includes(stagingKey) || writeKeys.includes(snapshotKey)) throw new Error("Import module key collides with transaction metadata key");

  const snapshot = snapshotKeys(storage, writeKeys);
  const transaction = {
    version: 1,
    createdAt: new Date().toISOString(),
    sourceExportedAt: plan.sourceExportedAt || null,
    writeKeys
  };

  storage.setItem(snapshotKey, JSON.stringify({ version: 1, createdAt: transaction.createdAt, entries: snapshot }));
  storage.setItem(stagingKey, JSON.stringify(transaction));

  try {
    for (const write of plan.writes) {
      storage.setItem(write.storageKey, JSON.stringify(clone(write.data)));
    }
    storage.removeItem(stagingKey);
    return Object.freeze({ committed: true, writes: writeKeys.length, snapshotKey, stagingKey });
  } catch (error) {
    try { restoreSnapshot(storage, snapshot); }
    finally { storage.removeItem(stagingKey); }
    const wrapped = new Error(`QTimer import commit failed and was rolled back: ${error.message || error}`);
    wrapped.cause = error;
    throw wrapped;
  }
}

/** Restore the most recent successful import's pre-import snapshot. */
export function restorePreImportSnapshot(storage, options = {}) {
  requireStorage(storage);
  const snapshotKey = String(options.snapshotKey || "qtimer.v2.preimport-snapshot");
  const stagingKey = String(options.stagingKey || "qtimer.v2.import-staging");
  if (storage.getItem(stagingKey)) throw new Error("Cannot undo import while an interrupted import marker exists; recover it first");
  const snapshot = readSnapshot(storage, snapshotKey);
  if (!snapshot) return { restored: false, reason: "no-snapshot" };
  restoreSnapshot(storage, snapshot.entries);
  if (options.clearSnapshot === true) storage.removeItem(snapshotKey);
  return { restored: true, restoredKeys: Object.keys(snapshot.entries).length, createdAt: snapshot.createdAt || null };
}

export function recoverInterruptedImport(storage, options = {}) {
  requireStorage(storage);
  const stagingKey = String(options.stagingKey || "qtimer.v2.import-staging");
  const snapshotKey = String(options.snapshotKey || "qtimer.v2.preimport-snapshot");
  const marker = storage.getItem(stagingKey);
  if (!marker) return { recovered: false, reason: "no-staging-marker" };
  const snapshot = readSnapshot(storage, snapshotKey);
  if (!snapshot) throw new Error("Interrupted import detected but pre-import snapshot is missing");
  restoreSnapshot(storage, snapshot.entries);
  storage.removeItem(stagingKey);
  return { recovered: true, restoredKeys: Object.keys(snapshot.entries).length };
}

export const BACKUP_IMPORT_LIMITS = DEFAULT_LIMITS;
