import { RequestHandler } from "express";
import { db } from "../db.js";

export const handleGetBloodBanks: RequestHandler = async (req, res) => {
  const { city, state, bloodGroup } = req.query;

  try {
    let bloodBanks = await db.bloodBank.findMany();

    // 1. Filter by State
    if (state && state !== "All") {
      const s = String(state).toLowerCase();
      bloodBanks = bloodBanks.filter((b) => b.state.toLowerCase() === s);
    }

    // 2. Filter by City
    if (city && city !== "All") {
      const c = String(city).toLowerCase();
      bloodBanks = bloodBanks.filter((b) => b.city.toLowerCase() === c);
    }

    // 3. Filter by blood group availability
    if (bloodGroup && bloodGroup !== "All") {
      const bg = String(bloodGroup);
      bloodBanks = bloodBanks.filter((b) => {
        switch (bg) {
          case "A+": return b.aPlus > 0;
          case "A-": return b.aMinus > 0;
          case "B+": return b.bPlus > 0;
          case "B-": return b.bMinus > 0;
          case "O+": return b.oPlus > 0;
          case "O-": return b.oMinus > 0;
          case "AB+": return b.abPlus > 0;
          case "AB-": return b.abMinus > 0;
          default: return true;
        }
      });
    }

    res.json(bloodBanks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
