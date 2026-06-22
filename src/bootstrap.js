import cors from "cors";
import dotenv from "dotenv";
import { DBconection } from "./DBconection.js";
import express from "express";
import { loadModels } from "./utils/face-config.js";
import { v1Router } from "./v1_routes.js";

dotenv.config();

export const bootstrap = async (app) => {
  await loadModels();
  console.log("✅ Models loaded!");
  
  app.use(cors());
  
  app.use("/api/v1", v1Router);

  app.use((error, req, res, next) => {
    const message = error.message;
    const status = error.status || 500;
    res.status(status).json({ message });
  });
  
  await DBconection();
};