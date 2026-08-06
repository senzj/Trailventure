import { Router } from "express";
import { db, serializeOrder } from "../db.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["pending", "processing", "completed", "cancelled"];

const ORDER_SELECT = `
  SELECT o.*, u.email AS owner_email
  FROM orders o
  LEFT JOIN users u ON u.id = o.user_id
`;

// POST /api/orders — place an order from the shopping cart. Works for guests
// and signed-in users; signed-in orders are linked to the purchaser's account.
router.post("/", optionalAuth, (req, res, next) => {
  try {
    const { customerName, email, paymentMethod, items, subtotal, shipping, total } =
      req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    if (!String(customerName ?? "").trim() || !String(email ?? "").trim()) {
      return res.status(400).json({ error: "Customer name and email are required" });
    }
    if (!Number.isFinite(Number(total))) {
      return res.status(400).json({ error: "Invalid order total" });
    }

    const userId = req.user ? req.user.id : null;
    const info = db
      .prepare(
        `INSERT INTO orders
           (user_id, customer_name, email, payment_method, items, subtotal, shipping, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      )
      .run(
        userId,
        String(customerName).trim(),
        String(email).trim(),
        String(paymentMethod ?? ""),
        JSON.stringify(items),
        Number(subtotal),
        Number(shipping),
        Number(total),
      );

    res.status(201).json({ order: serializeOrder(findById(info.lastInsertRowid)) });
  } catch (err) {
    next(err);
  }
});

function findById(id) {
  return db.prepare(`${ORDER_SELECT} WHERE o.id = ?`).get(id);
}

// GET /api/orders/mine — the signed-in user's purchase history.
router.get("/mine", requireAuth, (req, res, next) => {
  try {
    const rows = db
      .prepare(`${ORDER_SELECT} WHERE o.user_id = ? ORDER BY o.id DESC`)
      .all(req.user.id);
    res.json({ orders: rows.map(serializeOrder) });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders?status=pending — admin only.
router.get("/", requireAuth, requireAdmin, (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = ORDER_SELECT;
    const params = [];
    if (status) {
      sql += " WHERE o.status = ?";
      params.push(status);
    }
    sql += " ORDER BY o.id DESC";
    res.json({ orders: db.prepare(sql).all(...params).map(serializeOrder) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status — admin only.
router.put("/:id/status", requireAuth, requireAdmin, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = findById(id);
    if (!existing) return res.status(404).json({ error: "Order not found" });

    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
    res.json({ order: serializeOrder(findById(id)) });
  } catch (err) {
    next(err);
  }
});

export default router;