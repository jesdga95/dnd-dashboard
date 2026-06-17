"use client";

// An in-process fake of the slice of Firestore this app uses (docs + collections,
// including the `dm_combats/{uid}/events` subcollection, with equality-only queries),
// backed by localStorage so edits survive reloads and — crucially — `storage` events
// sync changes across browser windows. That gives the demo real DM <-> player live
// sync without any backend. Only used when NEXT_PUBLIC_DEMO=1; the data seam
// (src/lib/data.ts) routes hooks here instead of the real SDK.

import { seedData, type Store } from "./seed";

const STORE_KEY = "demo:store";

type DocData = Record<string, unknown>;

interface DocRef {
  __type: "doc";
  path: string;
}
interface CollRef {
  __type: "collection";
  path: string;
}
interface Constraint {
  field: string;
  value: unknown;
}
interface Query {
  __type: "query";
  path: string;
  constraints: Constraint[];
}

interface DocSnap {
  id: string;
  ref: DocRef;
  exists: () => boolean;
  data: () => DocData | undefined;
}
interface QuerySnap {
  docs: DocSnap[];
  empty: boolean;
  size: number;
  forEach: (fn: (d: DocSnap) => void) => void;
}

interface DocListener {
  path: string;
  cb: (snap: DocSnap) => void;
}
interface QueryListener {
  path: string; // collection path
  constraints: Constraint[];
  cb: (snap: QuerySnap) => void;
}

const docListeners = new Set<DocListener>();
const queryListeners = new Set<QueryListener>();

// Lazily initialised so the module is safe to import during SSR (no window access at load).
let store: Store | null = null;

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // Corrupted storage — fall through to a fresh seed.
  }
  const seeded = seedData();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
  } catch {
    // Storage unavailable — keep the seed in memory only.
  }
  return seeded;
}

function ensure(): Store {
  if (store === null) {
    store = load();
    if (typeof window !== "undefined") {
      // Another window mutated the store — pull its version in and re-fire listeners.
      window.addEventListener("storage", (e) => {
        if (e.key !== STORE_KEY) return;
        store = e.newValue ? (JSON.parse(e.newValue) as Store) : {};
        notifyAll();
      });
    }
  }
  return store;
}

function persist() {
  if (typeof window === "undefined" || store === null) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable.
  }
}

function clone<T>(value: T): T {
  return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}

// The collection a document lives in = its path minus the trailing doc id.
// "party_notes/x" -> "party_notes"; "dm_combats/u/events/e" -> "dm_combats/u/events".
const collPathOf = (path: string) => path.split("/").slice(0, -1).join("/");

function makeDocSnap(path: string, data: DocData | undefined): DocSnap {
  return {
    id: path.split("/").pop() as string,
    ref: { __type: "doc", path },
    exists: () => data !== undefined,
    data: () => (data === undefined ? undefined : clone(data)),
  };
}

function queryDocs(path: string, constraints: Constraint[]): QuerySnap {
  const s = ensure();
  const docs = Object.entries(s)
    .filter(([p]) => collPathOf(p) === path)
    .filter(([, data]) => constraints.every((c) => data[c.field] === c.value))
    .map(([p, data]) => makeDocSnap(p, data));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn) => docs.forEach(fn) };
}

function fireDoc(l: DocListener) {
  l.cb(makeDocSnap(l.path, ensure()[l.path]));
}

function fireQuery(l: QueryListener) {
  l.cb(queryDocs(l.path, l.constraints));
}

// Re-fire every listener affected by a write to `path` (the doc itself + any query
// over its collection). Used for in-tab writes.
function notifyPath(path: string) {
  for (const l of docListeners) if (l.path === path) fireDoc(l);
  const coll = collPathOf(path);
  for (const l of queryListeners) if (l.path === coll) fireQuery(l);
}

// Re-fire everything (used when another tab replaces the whole store).
function notifyAll() {
  for (const l of docListeners) fireDoc(l);
  for (const l of queryListeners) fireQuery(l);
}

// ---- field-value sentinels (arrayUnion / arrayRemove) ----

interface Sentinel {
  __op: "arrayUnion" | "arrayRemove";
  values: unknown[];
}

function isSentinel(v: unknown): v is Sentinel {
  return typeof v === "object" && v !== null && "__op" in v;
}

function resolveField(current: unknown, incoming: unknown): unknown {
  if (!isSentinel(incoming)) return incoming;
  const arr = Array.isArray(current) ? [...current] : [];
  if (incoming.__op === "arrayUnion") {
    for (const v of incoming.values) if (!arr.includes(v)) arr.push(v);
    return arr;
  }
  return arr.filter((x) => !incoming.values.includes(x));
}

function applySet(ref: DocRef, data: DocData, options?: { merge?: boolean }) {
  const s = ensure();
  const base = options?.merge ? (s[ref.path] ?? {}) : {};
  const next: DocData = { ...base };
  for (const [k, v] of Object.entries(data)) next[k] = resolveField((base as DocData)[k], v);
  s[ref.path] = clone(next);
}

function applyUpdate(ref: DocRef, patch: DocData) {
  const s = ensure();
  const existing = (s[ref.path] ?? {}) as DocData;
  const next: DocData = { ...existing };
  for (const [k, v] of Object.entries(patch)) next[k] = resolveField(existing[k], v);
  s[ref.path] = clone(next);
}

let autoIdCounter = 0;
function autoId(): string {
  return `auto-${Date.now().toString(36)}-${(autoIdCounter++).toString(36)}`;
}

// ---- public API (mirrors the firebase/firestore functions the app calls) ----

export const db = { __demo: true as const };

export function doc(_db: unknown, ...parts: string[]): DocRef {
  return { __type: "doc", path: parts.join("/") };
}

export function collection(_db: unknown, ...parts: string[]): CollRef {
  return { __type: "collection", path: parts.join("/") };
}

export function where(field: string, _op: string, value: unknown): Constraint {
  return { field, value };
}

export function query(coll: CollRef, ...constraints: Constraint[]): Query {
  return { __type: "query", path: coll.path, constraints };
}

export function onSnapshot(
  ref: DocRef | CollRef | Query,
  onNext: (snap: DocSnap | QuerySnap) => void
): () => void {
  ensure();
  if (ref.__type === "doc") {
    const l: DocListener = { path: ref.path, cb: onNext };
    docListeners.add(l);
    queueMicrotask(() => docListeners.has(l) && fireDoc(l));
    return () => void docListeners.delete(l);
  }
  const constraints = ref.__type === "query" ? ref.constraints : [];
  const l: QueryListener = { path: ref.path, constraints, cb: onNext };
  queryListeners.add(l);
  queueMicrotask(() => queryListeners.has(l) && fireQuery(l));
  return () => void queryListeners.delete(l);
}

export async function getDocs(ref: CollRef | Query): Promise<QuerySnap> {
  const constraints = ref.__type === "query" ? ref.constraints : [];
  return queryDocs(ref.path, constraints);
}

export async function setDoc(ref: DocRef, data: DocData, options?: { merge?: boolean }): Promise<void> {
  applySet(ref, data, options);
  persist();
  notifyPath(ref.path);
}

export async function updateDoc(ref: DocRef, patch: DocData): Promise<void> {
  applyUpdate(ref, patch);
  persist();
  notifyPath(ref.path);
}

export async function deleteDoc(ref: DocRef): Promise<void> {
  delete ensure()[ref.path];
  persist();
  notifyPath(ref.path);
}

export async function addDoc(coll: CollRef, data: DocData): Promise<DocRef> {
  const ref: DocRef = { __type: "doc", path: `${coll.path}/${autoId()}` };
  ensure()[ref.path] = clone(data);
  persist();
  notifyPath(ref.path);
  return ref;
}

export function arrayUnion(...values: unknown[]): Sentinel {
  return { __op: "arrayUnion", values };
}

export function arrayRemove(...values: unknown[]): Sentinel {
  return { __op: "arrayRemove", values };
}

export function writeBatch() {
  const paths = new Set<string>();
  const ops: Array<() => void> = [];
  const batch = {
    set(ref: DocRef, data: DocData, options?: { merge?: boolean }) {
      paths.add(ref.path);
      ops.push(() => applySet(ref, data, options));
      return batch;
    },
    update(ref: DocRef, patch: DocData) {
      paths.add(ref.path);
      ops.push(() => applyUpdate(ref, patch));
      return batch;
    },
    delete(ref: DocRef) {
      paths.add(ref.path);
      ops.push(() => void delete ensure()[ref.path]);
      return batch;
    },
    async commit() {
      ops.forEach((op) => op());
      persist();
      paths.forEach((p) => notifyPath(p));
    },
  };
  return batch;
}

// Wipe and re-seed (the DemoBar "Reset" button). The caller reloads afterward.
export function resetStore(): void {
  store = seedData();
  persist();
  notifyAll();
}
