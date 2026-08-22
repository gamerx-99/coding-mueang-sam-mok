import "dotenv/config";
import express from "express";
import path from "node:path";
import { createApiApp } from "./server/app";

const app = createApiApp();
const publicPath = path.resolve(process.cwd(), "public");

// Vercel serves files in public through its CDN. This fallback also keeps the
// app usable when the Express entry is executed locally or through a function.
app.use(express.static(publicPath));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
