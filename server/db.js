import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = path.join(__dirname, "data");

// DB location is env-driven so it can be moved on a hosted server.
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(dataDir, "trailventure.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    username      TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user'
      CHECK (role IN ('user', 'admin', 'superadmin')),
    name          TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    address       TEXT NOT NULL DEFAULT '',
    theme         TEXT NOT NULL DEFAULT 'light',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price       REAL NOT NULL,
    discount    REAL NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    image       TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name  TEXT NOT NULL,
    email          TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT '',
    items          TEXT NOT NULL DEFAULT '[]',
    subtotal       REAL NOT NULL DEFAULT 0,
    shipping       REAL NOT NULL DEFAULT 0,
    total          REAL NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Lightweight migrations for databases created before a column was added.
const productColumns = db.pragma("table_info(products)").map((col) => col.name);
if (!productColumns.includes("discount")) {
  db.exec("ALTER TABLE products ADD COLUMN discount REAL NOT NULL DEFAULT 0");
}

// Rebuilds the users table when it's missing the username column or the
// role CHECK doesn't allow 'superadmin' yet. Uses a swap-in table so foreign
// keys (sessions, orders) keep pointing at "users".
function ensureUsersSchema() {
  const userColumns = db.pragma("table_info(users)").map((col) => col.name);
  const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get()?.sql ?? "";
  const hasSuperadmin = tableSql.includes("'superadmin'");
  const hasUsername = userColumns.includes("username");
  if (hasSuperadmin && hasUsername) return;

  const pick = (name, fallback) => (userColumns.includes(name) ? name : `${fallback} AS ${name}`);
  const select = [
    "id",
    "email",
    pick("username", "''"),
    "password_hash",
    "role",
    pick("name", "''"),
    pick("phone", "''"),
    pick("address", "''"),
    pick("theme", "'light'"),
    "created_at",
  ].join(", ");

  db.pragma("foreign_keys = OFF");
  try {
    db.exec("BEGIN");
    db.exec(`
      CREATE TABLE users_new (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT NOT NULL UNIQUE,
        username      TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'user'
          CHECK (role IN ('user', 'admin', 'superadmin')),
        name          TEXT NOT NULL DEFAULT '',
        phone         TEXT NOT NULL DEFAULT '',
        address       TEXT NOT NULL DEFAULT '',
        theme         TEXT NOT NULL DEFAULT 'light',
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    db.exec(`
      INSERT INTO users_new (id, email, username, password_hash, role, name, phone, address, theme, created_at)
      SELECT ${select} FROM users
    `);
    db.exec("DROP TABLE users");
    db.exec("ALTER TABLE users_new RENAME TO users");
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    db.pragma("foreign_keys = ON");
  }
}
ensureUsersSchema();

// Maps a user row to the camelCase shape used by the frontend.
export function serializeUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username || "",
    name: row.name || "",
    phone: row.phone || "",
    address: row.address || "",
    theme: row.theme || "light",
    role: row.role,
    createdAt: row.created_at,
  };
}

// Maps a database row to the camelCase shape used by the frontend.
export function serializeProduct(row) {
  return {
    productID: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    discount: row.discount ?? 0,
    stock: row.stock,
    categoryId: row.category_id ?? null,
    category: row.category_name ?? null,
    image: row.image,
    createdAt: row.created_at,
  };
}

// Maps an order row to the camelCase shape used by the frontend.
export function serializeOrder(row) {
  return {
    orderID: row.id,
    customerName: row.customer_name,
    email: row.email,
    paymentMethod: row.payment_method,
    items: JSON.parse(row.items || "[]"),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;
