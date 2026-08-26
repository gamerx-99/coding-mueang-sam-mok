import type { Express } from "express";
import express from "express";

export function registerLocalMediaRoutes(app: Express) {
  app.use("/media", express.static("media"));
}

export function registerServerRoutes(app: Express) {
  registerLocalMediaRoutes(app);
}
