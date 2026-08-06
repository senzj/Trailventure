import { Router } from "express";
import { db, serializeUser } from "../db.js";
import { hashPassword } from "../utils/password.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router = Router();

const ROLES = ["user", "admin", "superadmin"];
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

router.use(requireAuth, requireSuperAdmin);

function normalizeUsername(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return { value: "" };
  if (!USERNAME_PATTERN.test(normalized)) {
    return { error: "Username must be 3-30 characters (letters, numbers, underscores)" };
  }
  return { value: normalized };
}

function assertEmailUnique(email, excludeId = null) {
  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (row && (!excludeId || row.id !== excludeId)) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }
}

function assertUsernameUnique(username, excludeId = null) {
  if (!username) return;
  const row = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (row && (!excludeId || row.id !== excludeId)) {
    throw Object.assign(new Error("Username already in use"), { status: 409 });
  }
}

// GET /api/users — list every account (super admin only).
router.get("/", (req, res, next) => {
  try {
    const users = db.prepare("SELECT * FROM users ORDER BY id ASC").all().map(serializeUser);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/users — create a new account (super admin only).
router.post("/", (req, res, next) => {
  try {
    const { email, username, name, phone, address, password, role } = req.body ?? {};
    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const { value: nextUsername, error: usernameError } = normalizeUsername(username);
    if (usernameError) return res.status(400).json({ error: usernameError });

    try {
      assertEmailUnique(normalizedEmail);
      assertUsernameUnique(nextUsername);
    } catch (err) {
      return res.status(err.status ?? 500).json({ error: err.message });
    }

    const nextRole = ROLES.includes(role) ? role : "user";
    const info = db
      .prepare(
        `INSERT INTO users (email, username, name, phone, address, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        normalizedEmail,
        nextUsername,
        String(name ?? "").slice(0, 120),
        String(phone ?? "").slice(0, 40),
        String(address ?? "").slice(0, 255),
        hashPassword(password),
        nextRole,
      );

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role — promote/demote a user's role (super admin only).
router.put("/:id/role", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body ?? {};

    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }

    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.json({ user: serializeUser(updated) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id — edit a user's profile (super admin only).
router.put("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "User not found" });

    const { username, name, phone, address, role, password } = req.body ?? {};
    const isSelf = id === req.user.id;

    const nextUsernameRaw = username === undefined ? existing.username : username;
    const { value: nextUsername, error: usernameError } = normalizeUsername(nextUsernameRaw);
    if (usernameError) return res.status(400).json({ error: usernameError });

    const nextRole = role === undefined ? existing.role : ROLES.includes(role) ? role : existing.role;
    if (isSelf && nextRole !== "superadmin") {
      return res.status(400).json({ error: "You cannot remove your own super admin role" });
    }

    if (password !== undefined && password !== "") {
      if (String(password).length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
    }

    try {
      assertUsernameUnique(nextUsername, id);
    } catch (err) {
      return res.status(err.status ?? 500).json({ error: err.message });
    }

    const nextName = name === undefined ? existing.name : String(name ?? "").slice(0, 120);
    const nextPhone = phone === undefined ? existing.phone : String(phone ?? "").slice(0, 40);
    const nextAddress = address === undefined ? existing.address : String(address ?? "").slice(0, 255);
    const nextHash =
      password !== undefined && password !== ""
        ? hashPassword(password)
        : existing.password_hash;

    db.prepare(
      "UPDATE users SET username = ?, name = ?, phone = ?, address = ?, role = ?, password_hash = ? WHERE id = ?",
    ).run(nextUsername, nextName, nextPhone, nextAddress, nextRole, nextHash, id);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.json({ user: serializeUser(updated) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — remove an account (super admin only).
router.delete("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const info = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;