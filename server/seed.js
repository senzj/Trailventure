import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { db } from "./db.js";
import { hashPassword } from "./utils/password.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images", "products");

export const DEMO_ADMIN = { email: "admin@trailventure.com", password: "Admin123!" };
export const DEMO_SUPERADMIN = { email: "superadmin@trailventure.com", password: "Super123!" };
export const DEMO_USER = { email: "user@trailventure.com", password: "User123!" };

const CATEGORIES = ["Tents", "Backpacks", "Cooking", "Lighting", "Sleeping"];

// [name, category, price, stock, description, image gradient colors]
const PRODUCTS = [
  ["Summit Ridge 2-Person Tent", "Tents", 249.99, 15, "Weatherproof four-season tent with a fully sealed rainfly and quick-pitch aluminium poles.", "#2563EB", "#1E40AF"],
  ["Alpine Trail 60L Backpack", "Backpacks", 189.99, 22, "Lightweight, breathable 60L pack with adjustable hip belt and multiple access points.", "#F59E0B", "#B45309"],
  ["Ridge Runner 32L Daypack", "Backpacks", 79.99, 32, "Compact daypack with hydration sleeve, padded laptop pocket, and side bottle holders.", "#FBBF24", "#D97706"],
  ["Campfire Titanium Cook Set", "Cooking", 89.99, 28, "2-piece titanium cookset with nesting mugs and foldable handles for ultra-light packing.", "#10B981", "#047857"],
  ["Northwind 400LM Headlamp", "Lighting", 34.99, 45, "Bright 400-lumen rechargeable headlamp with red-light mode and motion sensor.", "#F43F5E", "#9F1239"],
  ["Ember Camp Lantern", "Lighting", 44.99, 35, "Warm, dimmable LED lantern that doubles as an emergency power bank.", "#FB7185", "#BE123C"],
  ["Timberline Sleeping Bag -5C", "Sleeping", 119.99, 18, "Season-rated down sleeping bag rated to -5C with a compressible stuff sack.", "#8B5CF6", "#5B21B6"],
  ["Cloudrest Sleeping Pad", "Sleeping", 64.99, 30, "Lightweight, self-inflating pad with thermal insulation and packable design.", "#A78BFA", "#7C3AED"],
];

function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSvg(name, from, to) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="640" cy="130" r="70" fill="#ffffff" opacity="0.85"/>
  <path d="M0 540 L220 220 L360 420 L470 300 L600 500 L800 340 L800 600 L0 600 Z" fill="#ffffff" opacity="0.20"/>
  <path d="M0 600 L270 380 L430 540 L580 450 L720 600 Z" fill="#ffffff" opacity="0.45"/>
  <text x="400" y="80" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="bold" fill="#ffffff">${escapeXml(name)}</text>
  <text x="400" y="575" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#ffffff" opacity="0.9">Trailventure Gear</text>
</svg>
`;
}

function ensureProductImage(name, from, to) {
  fs.mkdirSync(imagesDir, { recursive: true });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const file = path.join(imagesDir, `${slug}.svg`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, buildSvg(name, from, to));
  }
  return `/images/products/${slug}.svg`;
}

export function seedIfEmpty() {
  // Ensure the demo super admin account exists (runs on every server start).
  db.prepare(
    "INSERT OR IGNORE INTO users (email, username, password_hash, role) VALUES (?, ?, ?, 'superadmin')",
  ).run(DEMO_SUPERADMIN.email, "superadmin", hashPassword(DEMO_SUPERADMIN.password));

  // Keep the demo accounts' usernames in sync even on pre-existing databases.
  const backfill = db.prepare(
    "UPDATE users SET username = ? WHERE email = ? AND (username IS NULL OR username = '')",
  );
  backfill.run("admin", DEMO_ADMIN.email);
  backfill.run("superadmin", DEMO_SUPERADMIN.email);
  backfill.run("camper", DEMO_USER.email);

  const { n } = db.prepare("SELECT COUNT(*) AS n FROM products").get();
  if (n > 0) return;

  const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  const getCategory = db.prepare("SELECT id FROM categories WHERE name = ?");

  CATEGORIES.forEach((name) => insertCategory.run(name));

  db.prepare(
    "INSERT OR IGNORE INTO users (email, username, password_hash, role) VALUES (?, ?, ?, 'admin')",
  ).run(DEMO_ADMIN.email, "admin", hashPassword(DEMO_ADMIN.password));
  db.prepare(
    "INSERT OR IGNORE INTO users (email, username, password_hash, role) VALUES (?, ?, ?, 'user')",
  ).run(DEMO_USER.email, "camper", hashPassword(DEMO_USER.password));

  const insertProduct = db.prepare(
    "INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)",
  );

  for (const [name, category, price, stock, description, from, to] of PRODUCTS) {
    const cat = getCategory.get(category);
    insertProduct.run(
      name,
      description,
      price,
      stock,
      cat.id,
      ensureProductImage(name, from, to),
    );
  }
}

// Allow running directly: `node server/seed.js`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedIfEmpty();
  console.log("Database seeded.");
}