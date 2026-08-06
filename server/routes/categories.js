import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res, next) => {
  try {
    const categories = db.prepare("SELECT id, name FROM categories ORDER BY name").all();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

export default router;