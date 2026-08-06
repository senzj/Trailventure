import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, serializeUser } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const THEMES = ["light", "dark"];

// Normalizes a username value: { value } on success ("" = unset), { error } otherwise.
function normalizeUsername(value, current = "") {
  const raw = value === undefined ? current : String(value);
  const normalized = raw.trim();
  if (normalized === "") return { value: "" };
  if (!USERNAME_PATTERN.test(normalized)) {
    return { error: "Username must be 3-30 characters (letters, numbers, underscores)" };
  }
  return { value: normalized };
}

function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  return token;
}

router.post("/signup", (req, res, next) => {
  try {
    const { email, password, username, name, phone, address } = req.body ?? {};
    const normalized = String(email ?? "").trim().toLowerCase();

    if (!normalized) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!EMAIL_PATTERN.test(normalized)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const { value: nextUsername, error: usernameError } = normalizeUsername(username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }
    if (nextUsername) {
      const taken = db.prepare("SELECT id FROM users WHERE username = ?").get(nextUsername);
      if (taken) {
        return res.status(409).json({ error: "Username already in use" });
      }
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalized);
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const info = db
      .prepare(
        `INSERT INTO users (email, username, name, phone, address, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, 'user')`,
      )
      .run(
        normalized,
        nextUsername,
        String(name ?? "").slice(0, 120),
        String(phone ?? "").slice(0, 40),
        String(address ?? "").slice(0, 255),
        hashPassword(password),
      );

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    const token = createSession(user.id);

    res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const normalized = String(email ?? "").trim().toLowerCase();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalized);
    if (!user || !verifyPassword(String(password ?? ""), user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createSession(user.id);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

// PUT /api/auth/me — update the signed-in user's profile and/or theme.
router.put("/me", requireAuth, (req, res, next) => {
  try {
    const { name, phone, address, theme, username } = req.body ?? {};

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

    const nextName = name === undefined ? user.name : String(name ?? "").slice(0, 120);
    const nextPhone = phone === undefined ? user.phone : String(phone ?? "").slice(0, 40);
    const nextAddress = address === undefined ? user.address : String(address ?? "").slice(0, 255);
    const nextTheme = theme === undefined ? user.theme : THEMES.includes(theme) ? theme : "light";

    const { value: nextUsername, error: usernameError } = normalizeUsername(username, user.username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }
    if (nextUsername) {
      const taken = db.prepare("SELECT id FROM users WHERE username = ?").get(nextUsername);
      if (taken && taken.id !== user.id) {
        return res.status(409).json({ error: "Username already in use" });
      }
    }

    db.prepare(
      "UPDATE users SET name = ?, phone = ?, address = ?, theme = ?, username = ? WHERE id = ?",
    ).run(nextName, nextPhone, nextAddress, nextTheme, nextUsername, user.id);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    res.json({ user: serializeUser(updated) });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.token);
  res.json({ ok: true });
});

export default router;