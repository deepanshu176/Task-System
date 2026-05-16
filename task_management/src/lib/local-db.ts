import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

type DocumentRecord = Record<string, unknown>;
type SortSpec = Record<string, 1 | -1>;
type ProjectionSpec = Record<string, 0 | 1>;
type Query = Record<string, unknown>;

type Store = {
  users: DocumentRecord[];
  roles: DocumentRecord[];
  permissions: DocumentRecord[];
  projects: DocumentRecord[];
  tasks: DocumentRecord[];
};

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'local-db.json');

const DEFAULT_STORE: Store = {
  users: [],
  roles: [
    {
      _id: new ObjectId().toString(),
      name: 'MEMBER',
      description: 'Standard member role',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: new ObjectId().toString(),
      name: 'ADMIN',
      description: 'Administrator role',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  permissions: [],
  projects: [],
  tasks: []
};

function collectionName(name: string): keyof Store {
  if (name in DEFAULT_STORE) return name as keyof Store;
  throw new Error(`Unknown local collection: ${name}`);
}

function normalize(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as DocumentRecord).map(([key, item]) => [key, normalize(item)])
    );
  }
  return value;
}

function valueAt(document: DocumentRecord, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as DocumentRecord)[part];
  }, document);
}

function sameValue(left: unknown, right: unknown): boolean {
  return String(normalize(left)) === String(normalize(right));
}

function matchesValue(actual: unknown, expected: unknown): boolean {
  if (expected && typeof expected === 'object' && !(expected instanceof ObjectId) && !(expected instanceof Date) && !Array.isArray(expected)) {
    const spec = expected as Query;
    if ('$in' in spec) {
      const values = Array.isArray(spec.$in) ? spec.$in : [];
      if (Array.isArray(actual)) return actual.some((item) => values.some((value) => sameValue(item, value)));
      return values.some((value) => sameValue(actual, value));
    }
    if ('$ne' in spec) return !sameValue(actual, spec.$ne);
  }

  if (Array.isArray(actual)) return actual.some((item) => sameValue(item, expected));
  return sameValue(actual, expected);
}

function matchesQuery(document: DocumentRecord, query: Query = {}): boolean {
  return Object.entries(query).every(([key, expected]) => {
    if (key === '$or') {
      const clauses = Array.isArray(expected) ? expected as Query[] : [];
      return clauses.some((clause) => matchesQuery(document, clause));
    }
    if (key === '$and') {
      const clauses = Array.isArray(expected) ? expected as Query[] : [];
      return clauses.every((clause) => matchesQuery(document, clause));
    }
    return matchesValue(valueAt(document, key), expected);
  });
}

function applyProjection(document: DocumentRecord, projection: ProjectionSpec = {}) {
  const entries = Object.entries(projection);
  if (entries.length === 0) return { ...document };

  const includes = entries.filter(([, value]) => value === 1).map(([key]) => key);
  if (includes.length > 0) {
    const projected: DocumentRecord = {};
    for (const key of includes) projected[key] = document[key];
    if (!('_id' in projection) || projection._id !== 0) projected._id = document._id;
    return projected;
  }

  const projected = { ...document };
  for (const [key, value] of entries) {
    if (value === 0) delete projected[key];
  }
  return projected;
}

function compareBySort(left: DocumentRecord, right: DocumentRecord, sort: SortSpec) {
  for (const [key, direction] of Object.entries(sort)) {
    const leftValue = valueAt(left, key);
    const rightValue = valueAt(right, key);
    if (leftValue === rightValue) continue;
    return (String(leftValue) > String(rightValue) ? 1 : -1) * direction;
  }
  return 0;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return { ...DEFAULT_STORE, ...JSON.parse(raw) };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await writeStore(DEFAULT_STORE);
      return { ...DEFAULT_STORE };
    }
    throw error;
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(normalize(store), null, 2));
}

class LocalCursor {
  private projection: ProjectionSpec = {};
  private sortSpec: SortSpec = {};
  private limitCount?: number;
  private skipCount = 0;

  constructor(private readonly docs: DocumentRecord[]) {}

  project(projection: ProjectionSpec) {
    this.projection = projection;
    return this;
  }

  sort(sort: SortSpec) {
    this.sortSpec = sort;
    return this;
  }

  limit(limit: number) {
    this.limitCount = limit;
    return this;
  }

  skip(skip: number) {
    this.skipCount = skip;
    return this;
  }

  async toArray() {
    let docs = [...this.docs];
    if (Object.keys(this.sortSpec).length) docs = docs.sort((left, right) => compareBySort(left, right, this.sortSpec));
    if (this.skipCount) docs = docs.slice(this.skipCount);
    if (this.limitCount !== undefined) docs = docs.slice(0, this.limitCount);
    return docs.map((doc) => applyProjection(doc, this.projection));
  }
}

class LocalCollection {
  constructor(private readonly name: keyof Store) {}

  async docs() {
    const store = await readStore();
    return store[this.name];
  }

  find(query: Query = {}) {
    return new LocalCursorSync(this.name, query);
  }

  async findOne(query: Query = {}, options: { projection?: ProjectionSpec } = {}) {
    const doc = (await this.docs()).find((item) => matchesQuery(item, query));
    return doc ? applyProjection(doc, options.projection) : null;
  }

  async insertOne(document: DocumentRecord) {
    const store = await readStore();
    const insertedId = document._id ? String(normalize(document._id)) : new ObjectId().toString();
    store[this.name].push({ ...normalize(document) as DocumentRecord, _id: insertedId });
    await writeStore(store);
    return { insertedId };
  }

  async updateOne(query: Query, update: { $set?: DocumentRecord }) {
    const store = await readStore();
    const index = store[this.name].findIndex((item) => matchesQuery(item, query));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
    store[this.name][index] = { ...store[this.name][index], ...normalize(update.$set || {}) as DocumentRecord };
    await writeStore(store);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query: Query) {
    const store = await readStore();
    const before = store[this.name].length;
    store[this.name] = store[this.name].filter((item) => !matchesQuery(item, query));
    await writeStore(store);
    return { deletedCount: before - store[this.name].length > 0 ? 1 : 0 };
  }

  async deleteMany(query: Query) {
    const store = await readStore();
    const before = store[this.name].length;
    store[this.name] = store[this.name].filter((item) => !matchesQuery(item, query));
    await writeStore(store);
    return { deletedCount: before - store[this.name].length };
  }

  async countDocuments(query: Query = {}) {
    return (await this.docs()).filter((item) => matchesQuery(item, query)).length;
  }

  aggregate(pipeline: Query[] = []) {
    return new LocalAggregateCursor(this.name, pipeline);
  }

  async createIndex() {
    return 'local-index';
  }
}

class LocalCursorSync {
  private projection: ProjectionSpec = {};
  private sortSpec: SortSpec = {};
  private limitCount?: number;
  private skipCount = 0;

  constructor(private readonly name: keyof Store, private readonly query: Query) {}

  project(projection: ProjectionSpec) {
    this.projection = projection;
    return this;
  }

  sort(sort: SortSpec) {
    this.sortSpec = sort;
    return this;
  }

  limit(limit: number) {
    this.limitCount = limit;
    return this;
  }

  skip(skip: number) {
    this.skipCount = skip;
    return this;
  }

  async toArray() {
    const store = await readStore();
    return new LocalCursor(store[this.name].filter((item) => matchesQuery(item, this.query)))
      .project(this.projection)
      .sort(this.sortSpec)
      .skip(this.skipCount)
      .limit(this.limitCount ?? Number.MAX_SAFE_INTEGER)
      .toArray();
  }
}

class LocalAggregateCursor {
  constructor(private readonly name: keyof Store, private readonly pipeline: Query[]) {}

  async toArray() {
    const store = await readStore();
    let docs = [...store[this.name]];

    for (const stage of this.pipeline) {
      if ('$match' in stage) docs = docs.filter((doc) => matchesQuery(doc, stage.$match as Query));
      if ('$skip' in stage) docs = docs.slice(Number(stage.$skip));
      if ('$limit' in stage) docs = docs.slice(0, Number(stage.$limit));
      if ('$lookup' in stage) {
        const lookup = stage.$lookup as { from: keyof Store; localField: string; foreignField: string; as: string };
        docs = docs.map((doc) => ({
          ...doc,
          [lookup.as]: store[lookup.from].filter((item) => sameValue(valueAt(doc, lookup.localField), valueAt(item, lookup.foreignField)))
        }));
      }
      if ('$unwind' in stage) {
        const unwind = stage.$unwind as { path: string; preserveNullAndEmptyArrays?: boolean };
        const field = unwind.path.replace(/^\$/, '');
        docs = docs.flatMap((doc) => {
          const value = doc[field];
          if (Array.isArray(value) && value.length) return value.map((item) => ({ ...doc, [field]: item }));
          return unwind.preserveNullAndEmptyArrays ? [{ ...doc, [field]: null }] : [];
        });
      }
      if ('$addFields' in stage) {
        const additions = stage.$addFields as Query;
        docs = docs.map((doc) => {
          const next = { ...doc };
          for (const [key, value] of Object.entries(additions)) {
            if (typeof value === 'string' && value.startsWith('$')) next[key] = valueAt(doc, value.slice(1));
            else if (value && typeof value === 'object' && '$ifNull' in (value as Query)) {
              const [field, fallback] = (value as { $ifNull: unknown[] }).$ifNull;
              next[key] = valueAt(doc, String(field).replace(/^\$/, '')) ?? fallback;
            } else next[key] = value;
          }
          return next;
        });
      }
      if ('$project' in stage) docs = docs.map((doc) => applyProjection(doc, stage.$project as ProjectionSpec));
    }

    return docs;
  }
}

export function getLocalDB() {
  return {
    collection(name: string) {
      return new LocalCollection(collectionName(name));
    }
  };
}
