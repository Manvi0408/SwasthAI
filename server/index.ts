import "dotenv/config";
import express from "express";
import cors from "cors";

// Auth handlers
import {
  handleSendOtp,
  handleVerifyOtp,
  handleGoogleLogin,
  handleEmailLogin,
  handleGuestAccess,
  handleGetMe,
  handleOnboard,
  handleUpdateProfile,
} from "./routes/auth";

// Hospital handlers
import {
  handleGetHospitals,
  handleSaveHospital,
  handleUnsaveHospital,
} from "./routes/hospitals";

// Blood bank handlers
import { handleGetBloodBanks } from "./routes/blood-banks";

// Pharmacy handlers
import {
  handleGetMedicines,
  handleSaveMedicine,
  handleUnsaveMedicine,
  handleGetPharmacies,
} from "./routes/pharmacy";

// Triage handlers
import { handleTriage } from "./routes/triage";

// Emergency handlers
import { handleEmergencySos } from "./routes/emergency";

// Admin handlers
import {
  checkAdmin,
  handleGetUsers,
  handleDeleteUser,
  handleAddHospital,
  handleUpdateHospital,
  handleDeleteHospital,
  handleAddBloodBank,
  handleDeleteBloodBank,
  handleAddMedicine,
  handleDeleteMedicine,
  handleGetSOSRequests,
} from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Public/Session API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Auth routes
  app.post("/api/auth/send-otp", handleSendOtp);
  app.post("/api/auth/verify-otp", handleVerifyOtp);
  app.post("/api/auth/google", handleGoogleLogin);
  app.post("/api/auth/email", handleEmailLogin);
  app.post("/api/auth/guest", handleGuestAccess);
  app.get("/api/auth/me", handleGetMe);
  
  // Profile & Onboarding routes
  app.post("/api/onboard", handleOnboard);
  app.post("/api/profile/update", handleUpdateProfile);

  // Hospital Discovery routes
  app.get("/api/hospitals", handleGetHospitals);
  app.post("/api/hospitals/save", handleSaveHospital);
  app.post("/api/hospitals/unsave", handleUnsaveHospital);

  // Blood Bank routes
  app.get("/api/blood-banks", handleGetBloodBanks);

  // Pharmacy routes
  app.get("/api/pharmacy/medicines", handleGetMedicines);
  app.post("/api/pharmacy/save-medicine", handleSaveMedicine);
  app.post("/api/pharmacy/unsave-medicine", handleUnsaveMedicine);
  app.get("/api/pharmacy/stores", handleGetPharmacies);

  // AI Triage routes
  app.post("/api/triage", handleTriage);

  // Emergency SOS routes
  app.post("/api/emergency/sos", handleEmergencySos);

  // Admin routes (Protected)
  app.get("/api/admin/users", checkAdmin, handleGetUsers);
  app.delete("/api/admin/users/:id", checkAdmin, handleDeleteUser);
  app.post("/api/admin/hospitals", checkAdmin, handleAddHospital);
  app.put("/api/admin/hospitals/:id", checkAdmin, handleUpdateHospital);
  app.delete("/api/admin/hospitals/:id", checkAdmin, handleDeleteHospital);
  app.post("/api/admin/blood-banks", checkAdmin, handleAddBloodBank);
  app.delete("/api/admin/blood-banks/:id", checkAdmin, handleDeleteBloodBank);
  app.post("/api/admin/medicines", checkAdmin, handleAddMedicine);
  app.delete("/api/admin/medicines/:id", checkAdmin, handleDeleteMedicine);
  app.get("/api/admin/sos-requests", checkAdmin, handleGetSOSRequests);

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
