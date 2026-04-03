import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

let SQL: any = null;
let db: any = null;

const dataDir = path.resolve(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "tickets.sqlite");

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const persist = () => {
  if (!db) {
    return;
  }

  ensureDataDir();
  const binaryArray = db.export();
  fs.writeFileSync(dbFilePath, Buffer.from(binaryArray));
};

const createSchema = (database: any) => {
  database.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      confidence REAL NOT NULL,
      signals TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
};

export const getDb = async () => {
  if (db) {
    return db;
  }

  if (!SQL) {
    SQL = await initSqlJs({});
  }

  ensureDataDir();

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createSchema(db);
  persist();
  return db;
};

export const saveDb = () => persist();
