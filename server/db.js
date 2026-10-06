import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(currentDirectory, "data");

// Make a folder for the local database if it is missing.
mkdirSync(dataDirectory, { recursive: true });

// Open the database file, or make it if it is not there yet.
const db = new Database(join(dataDirectory, "healthcoversim.db"));

// Make the table the first time the server starts.
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    cover_type TEXT NOT NULL,
    applicant1_age INTEGER NOT NULL,
    applicant1_cover_history TEXT NOT NULL,
    applicant2_age INTEGER,
    applicant2_cover_history TEXT,
    hospital_cover TEXT NOT NULL,
    extras_cover TEXT NOT NULL,
    payment_frequency TEXT NOT NULL,
    annual_discount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
