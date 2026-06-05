import { RequestHandler } from "express";
import { db } from "../db.js";

export const handleGetMedicines: RequestHandler = async (req, res) => {
  const { query } = req.query;

  try {
    let medicines = await db.medicine.findMany();

    if (query) {
      const q = String(query).toLowerCase();
      medicines = medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q))
      );
    }

    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetPharmacies: RequestHandler = async (req, res) => {
  try {
    const stores = await db.pharmacy.findMany();
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
