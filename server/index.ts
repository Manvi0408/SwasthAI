import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";

// Public handlers
import { handleGetHospitals } from "./routes/hospitals.js";
import { handleGetBloodBanks } from "./routes/blood-banks.js";
import { handleGetMedicines, handleGetPharmacies } from "./routes/pharmacy.js";
import { handleTriage } from "./routes/triage.js";
import { handleEmergencySos } from "./routes/emergency.js";
import { handleSearch } from "./routes/search.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Public API ping route
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Unified Search route
  app.get("/api/search", handleSearch);

  // Hospital Discovery routes
  app.get("/api/hospitals", handleGetHospitals);

  // Blood Bank routes
  app.get("/api/blood-banks", handleGetBloodBanks);

  // Pharmacy routes
  app.get("/api/pharmacy/medicines", handleGetMedicines);
  app.get("/api/pharmacy/stores", handleGetPharmacies);

  // AI Triage routes
  app.post("/api/triage", handleTriage);

  // Emergency SOS routes
  app.post("/api/emergency/sos", handleEmergencySos);

  // Global JSON Error Handler (Must be registered last)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("API Server Error:", err);
    res.status(500).json({
      error: err.message || "Internal Server Error",
      code: err.code || "SERVER_ERROR",
    });
  });

  return app;
}
