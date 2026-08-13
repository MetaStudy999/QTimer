// QTimer V2 Storage Registry.
// Pure data-contract layer. Browser localStorage is intentionally not accessed here.

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function normalizeDescriptor(raw) {
  assertObject(raw, "Storage descriptor");
  const id = String(raw.id || "").trim();
  const storageKey = String(raw.storageKey || "").trim();
  const schemaVersion = Number(raw.schemaVersion);
  if (!/^[a-z][A-Za-z0-9]*$/.test(id)) throw new TypeError(`Invalid storage module id: ${id || "<missing>"}`);
  if (!storageKey) throw new TypeError(`Storage module ${id} requires storageKey`);
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) throw new TypeError(`Storage module ${id} requires positive schemaVersion`);
  if (typeof raw.validate !== "function") throw new TypeError(`Storage module ${id} requires validate(data)`);
  if (raw.migrate != null && typeof raw.migrate !== "function") throw new TypeError(`Storage module ${id} migrate must be a function`);

  return Object.freeze({
    id,
    storageKey,
    schemaVersion,
    defaultValue: clone(raw.defaultValue ?? {}),
    validate: raw.validate,
    migrate: raw.migrate || ((data, fromVersion) => {
      if (fromVersion !== schemaVersion) throw new Error(`No migration for ${id} ${fromVersion} -> ${schemaVersion}`);
      return data;
    }),
    exportable: raw.exportable !== false,
    sensitive: Boolean(raw.sensitive)
  });
}

export class StorageRegistry {
  #modules = new Map();
  #keys = new Map();

  register(rawDescriptor) {
    const descriptor = normalizeDescriptor(rawDescriptor);
    if (this.#modules.has(descriptor.id)) throw new Error(`Duplicate storage module id: ${descriptor.id}`);
    if (this.#keys.has(descriptor.storageKey)) {
      throw new Error(`Duplicate storageKey ${descriptor.storageKey}: ${this.#keys.get(descriptor.storageKey)} / ${descriptor.id}`);
    }
    this.#modules.set(descriptor.id, descriptor);
    this.#keys.set(descriptor.storageKey, descriptor.id);
    return this;
  }

  get(id) {
    return this.#modules.get(String(id)) || null;
  }

  list() {
    return [...this.#modules.values()];
  }

  exportable() {
    return this.list().filter(descriptor => descriptor.exportable);
  }

  normalizeModule(id, envelope) {
    const descriptor = this.get(id);
    if (!descriptor) throw new Error(`Unknown storage module: ${id}`);
    assertObject(envelope, `Module ${id}`);
    const fromVersion = Number(envelope.schemaVersion);
    if (!Number.isInteger(fromVersion) || fromVersion < 1) throw new TypeError(`Module ${id} has invalid schemaVersion`);

    const migrated = fromVersion === descriptor.schemaVersion
      ? clone(envelope.data)
      : descriptor.migrate(clone(envelope.data), fromVersion, descriptor.schemaVersion);

    const result = descriptor.validate(clone(migrated));
    if (result === false) throw new TypeError(`Module ${id} validation failed`);
    const canonical = result === true || result == null ? migrated : result;
    return {
      schemaVersion: descriptor.schemaVersion,
      data: clone(canonical)
    };
  }

  buildBackup(readValue, metadata = {}) {
    if (typeof readValue !== "function") throw new TypeError("buildBackup requires readValue(storageKey)");
    const modules = {};
    for (const descriptor of this.exportable()) {
      const value = readValue(descriptor.storageKey);
      const data = value == null ? clone(descriptor.defaultValue) : clone(value);
      const checked = descriptor.validate(clone(data));
      if (checked === false) throw new TypeError(`Stored module ${descriptor.id} failed validation`);
      modules[descriptor.id] = {
        schemaVersion: descriptor.schemaVersion,
        data: clone(checked === true || checked == null ? data : checked)
      };
    }
    return {
      format: "qtimer-backup",
      version: 2,
      exportedAt: metadata.exportedAt || new Date().toISOString(),
      appVersion: metadata.appVersion || "v2",
      questionBankVersion: metadata.questionBankVersion || null,
      modules
    };
  }

  /**
   * Validates and migrates every module in memory before any persistence layer is allowed to write.
   * The caller can commit the returned plan transactionally (snapshot -> staging -> commit -> clear staging).
   */
  prepareImport(payload, { rejectUnknown = true, maxModules = 50 } = {}) {
    assertObject(payload, "Backup payload");
    if (payload.format !== "qtimer-backup" || Number(payload.version) !== 2) {
      throw new TypeError("Unsupported QTimer backup envelope");
    }
    assertObject(payload.modules, "Backup modules");
    const entries = Object.entries(payload.modules);
    if (entries.length > maxModules) throw new RangeError(`Backup contains too many modules: ${entries.length}`);

    if (rejectUnknown) {
      const unknown = entries.map(([id]) => id).filter(id => !this.#modules.has(id));
      if (unknown.length) throw new Error(`Backup contains unknown modules: ${unknown.join(", ")}`);
    }

    const plan = [];
    for (const descriptor of this.list()) {
      if (!Object.prototype.hasOwnProperty.call(payload.modules, descriptor.id)) continue;
      const canonical = this.normalizeModule(descriptor.id, payload.modules[descriptor.id]);
      plan.push({
        id: descriptor.id,
        storageKey: descriptor.storageKey,
        schemaVersion: canonical.schemaVersion,
        data: canonical.data,
        sensitive: descriptor.sensitive
      });
    }
    return Object.freeze({
      format: payload.format,
      version: 2,
      sourceExportedAt: payload.exportedAt || null,
      questionBankVersion: payload.questionBankVersion || null,
      writes: clone(plan)
    });
  }
}

export function objectValidator({ requiredArrays = [], requiredObjects = [] } = {}) {
  return value => {
    assertObject(value, "Module data");
    for (const key of requiredArrays) {
      if (!Array.isArray(value[key])) throw new TypeError(`Module field ${key} must be an array`);
    }
    for (const key of requiredObjects) {
      if (!value[key] || typeof value[key] !== "object" || Array.isArray(value[key])) {
        throw new TypeError(`Module field ${key} must be an object`);
      }
    }
    return clone(value);
  };
}
