import { RequestHandler } from "express";
import { db } from "../db";

export const handleGetMedicines: RequestHandler = async (req, res) => {
  const { query, userId } = req.query;

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

    // Save search history
    if (userId && typeof userId === "string" && !userId.startsWith("guest_") && query) {
      await db.searchHistory.create({
        data: {
          userId,
          type: "PHARMACY",
          query: String(query),
        },
      });
    }

    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleSaveMedicine: RequestHandler = async (req, res) => {
  const { userId, medicineId, name, brandPrice, genericPrice, savings, availability } = req.body;

  if (!userId || !medicineId) {
    res.status(400).json({ error: "userId and medicineId are required" });
    return;
  }

  if (userId.startsWith("guest_")) {
    res.status(400).json({ error: "Guests cannot save medicines" });
    return;
  }

  try {
    const existing = await db.savedMedicine.findFirst({
      where: { userId, medicineId },
    });

    if (existing) {
      res.status(400).json({ error: "Medicine already saved" });
      return;
    }

    const saved = await db.savedMedicine.create({
      data: {
        userId,
        medicineId,
        name,
        brandPrice: parseFloat(brandPrice),
        genericPrice: parseFloat(genericPrice),
        savings: parseFloat(savings),
        availability: availability || "Available",
      },
    });

    res.json({ message: "Medicine saved successfully", saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUnsaveMedicine: RequestHandler = async (req, res) => {
  const { userId, medicineId } = req.body;

  if (!userId || !medicineId) {
    res.status(400).json({ error: "userId and medicineId are required" });
    return;
  }

  try {
    await db.savedMedicine.deleteMany({
      where: { userId, medicineId },
    });
    res.json({ message: "Saved medicine removed successfully" });
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
