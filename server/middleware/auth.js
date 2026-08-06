import { db } from "../db.js";

function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token);
  if (!session) return null;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id);
  return user ? { user, token } : null;
}

export function requireAuth(req, res, next) {
  const result = getUserFromRequest(req);
  if (!result) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = result.user;
  req.token = result.token;
  next();
}

// Like requireAuth but does not fail when no token is present. Useful for
// endpoints that accept both guests and signed-in users.
export function optionalAuth(req, res, next) {
  const result = getUserFromRequest(req);
  if (result) {
    req.user = result.user;
    req.token = result.token;
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}