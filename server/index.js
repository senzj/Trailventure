import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { seedIfEmpty } from "./seed.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isValidation = err.status === 400 || err?.name === "MulterError";
  const status = isValidation ? 400 : 500;
  console.error(err.message);
  res.status(status).json({ error: err.message || "Something went wrong" });
});

seedIfEmpty();

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Trailventure API running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Close the other Trailventure/API process and run \`npm run dev\` again.`);
    process.exit(1);
  }
  throw err;
});
