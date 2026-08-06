import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db, serializeProduct, PRODUCT_SELECT } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

function findById(id) {
  return db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id);
}

function imageUrl(file) {
  return file ? `/uploads/${file.filename}` : "";
}

function removeImage(url) {
  if (!url || !url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  const fullPath = path.join(uploadsDir, filename);
  fs.rm(fullPath, { force: true }, () => {});
}

// GET /api/products?category=&q=
router.get("/", (req, res, next) => {
  try {
    const { category, q } = req.query;
    const where = [];
    const params = [];

    if (category) {
      where.push("p.category_id = ?");
      params.push(Number(category));
    }
    if (q) {
      where.push("(p.name LIKE ? OR p.description LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like);
    }

    let sql = PRODUCT_SELECT;
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    sql += " ORDER BY p.id DESC";

    const products = db.prepare(sql).all(...params).map(serializeProduct);
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const product = findById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
});

function parseProductBody(body) {
  const { name, description, price, discount, stock, categoryId } = body;

  if (!name || !String(name).trim()) {
    const err = new Error("Product name is required");
    err.status = 400;
    throw err;
  }
  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    const err = new Error("Price must be a valid non-negative number");
    err.status = 400;
    throw err;
  }
  const parsedDiscount =
    discount === undefined || discount === "" ? 0 : Number(discount);
  if (Number.isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
    const err = new Error("Discount must be a percentage between 0 and 100");
    err.status = 400;
    throw err;
  }
  const parsedStock = stock === undefined || stock === "" ? 0 : Number(stock);
  const parsedCategory = categoryId ? Number(categoryId) : null;

  if (parsedCategory) {
    const cat = db.prepare("SELECT id FROM categories WHERE id = ?").get(parsedCategory);
    if (!cat) {
      const err = new Error("Category does not exist");
      err.status = 400;
      throw err;
    }
  }

  return {
    name: String(name).trim(),
    description: String(description ?? "").trim(),
    price: parsedPrice,
    discount: parsedDiscount,
    stock: parsedStock,
    categoryId: parsedCategory,
  };
}

router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  (req, res, next) => {
    try {
      const data = parseProductBody(req.body);
      const image = imageUrl(req.file);

      const info = db
        .prepare(
          `INSERT INTO products (name, description, price, discount, stock, category_id, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          data.name,
          data.description,
          data.price,
          data.discount,
          data.stock,
          data.categoryId,
          image,
        );

      res.status(201).json({ product: serializeProduct(findById(info.lastInsertRowid)) });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existing = findById(id);
      if (!existing) return res.status(404).json({ error: "Product not found" });

      const data = parseProductBody(req.body);
      const image = req.file ? imageUrl(req.file) : existing.image;
      if (req.file) removeImage(existing.image);

      db.prepare(
        `UPDATE products
         SET name = ?, description = ?, price = ?, discount = ?, stock = ?, category_id = ?, image = ?
         WHERE id = ?`,
      ).run(
        data.name,
        data.description,
        data.price,
        data.discount,
        data.stock,
        data.categoryId,
        image,
        id,
      );

      res.json({ product: serializeProduct(findById(id)) });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id", requireAuth, requireAdmin, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = findById(id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    removeImage(existing.image);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;