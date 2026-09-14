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
import { handleCreateAssessment, handleGetAssessmentHistory } from "./routes/health-risk.js";
import { handleAnalyzeReport, handleGetReportHistory } from "./routes/medical-report.js";
import { handleDetectInjury, handleGetInjuryHistory } from "./routes/injury.js";
import { handleGetAnalytics } from "./routes/analytics.js";
import { rateLimit } from "./security/guard.js";

export function createServer() {
  const app = express();

  // Baseline security response headers.
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-XSS-Protection", "0");
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" })); // support large image/pdf base64 uploads
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate limiters for the AI / LLM-backed endpoints (cost + abuse control).
  const aiLimiter = rateLimit({ windowMs: 60_000, max: 20, key: "ai" });
  const heavyLimiter = rateLimit({ windowMs: 60_000, max: 8, key: "ai-heavy" });

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

  // AI Triage routes (agentic loop)
  app.post("/api/triage", aiLimiter, handleTriage);

  // Emergency SOS routes
  app.post("/api/emergency/sos", handleEmergencySos);

  // Health Risk Assessment routes
  app.post("/api/health-risk", handleCreateAssessment);
  app.get("/api/health-risk/history", handleGetAssessmentHistory);

  // AI Medical Report routes
  app.post("/api/medical-report", heavyLimiter, handleAnalyzeReport);
  app.get("/api/medical-report/history", handleGetReportHistory);

  // AI Injury Detection routes
  app.post("/api/injury/detect", heavyLimiter, handleDetectInjury);
  app.get("/api/injury/history", handleGetInjuryHistory);

  // Healthcare Analytics routes
  app.get("/api/healthcare-analytics", handleGetAnalytics);


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
