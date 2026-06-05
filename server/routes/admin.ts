import { RequestHandler } from "express";
import { db } from "../db";

// Middleware to verify admin authorization
export const checkAdmin: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No authorization header" });
    return;
  }

  const userId = authHeader.replace("Bearer ", "");
  if (userId.startsWith("guest_")) {
    res.status(403).json({ error: "Access denied. Guests cannot perform admin actions." });
    return;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admin credentials required." });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 1. Manage Users
export const handleGetUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db.user.findMany({
      include: {
        profile: true,
        medicalInfo: true,
        locationInfo: true,
      },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Manage Hospitals
export const handleAddHospital: RequestHandler = async (req, res) => {
  const { name, address, type, services, beds, rating, phone, lat, lng } = req.body;
  try {
    const hospital = await db.hospital.create({
      data: {
        name,
        address,
        type,
        services,
        beds,
        rating: parseFloat(rating) || 4.0,
        phone,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });
    res.json({ message: "Hospital added successfully", hospital });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateHospital: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, address, type, services, beds, rating, phone, lat, lng } = req.body;
  try {
    const hospital = await db.hospital.update({
      where: { id },
      data: {
        name,
        address,
        type,
        services,
        beds,
        rating: rating ? parseFloat(rating) : undefined,
        phone,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      },
    });
    res.json({ message: "Hospital updated successfully", hospital });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteHospital: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.hospital.delete({ where: { id } });
    res.json({ message: "Hospital deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Manage Blood Banks
export const handleAddBloodBank: RequestHandler = async (req, res) => {
  const { name, address, city, state, phone, lat, lng, aPlus, aMinus, bPlus, bMinus, oPlus, oMinus, abPlus, abMinus } = req.body;
  try {
    const bloodBank = await db.bloodBank.create({
      data: {
        name, address, city, state, phone,
        lat: parseFloat(lat), lng: parseFloat(lng),
        aPlus: parseInt(aPlus) || 0,
        aMinus: parseInt(aMinus) || 0,
        bPlus: parseInt(bPlus) || 0,
        bMinus: parseInt(bMinus) || 0,
        oPlus: parseInt(oPlus) || 0,
        oMinus: parseInt(oMinus) || 0,
        abPlus: parseInt(abPlus) || 0,
        abMinus: parseInt(abMinus) || 0,
      },
    });
    res.json({ message: "Blood bank added successfully", bloodBank });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteBloodBank: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.bloodBank.delete({ where: { id } });
    res.json({ message: "Blood bank deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Manage Medicines
export const handleAddMedicine: RequestHandler = async (req, res) => {
  const { name, genericName, brandPrice, genericPrice, description, category, availability } = req.body;
  try {
    const bp = parseFloat(brandPrice);
    const gp = parseFloat(genericPrice);
    const medicine = await db.medicine.create({
      data: {
        name,
        genericName,
        brandPrice: bp,
        genericPrice: gp,
        savings: bp - gp,
        description,
        category,
        availability: availability || "Available",
      },
    });
    res.json({ message: "Medicine added successfully", medicine });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteMedicine: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.medicine.delete({ where: { id } });
    res.json({ message: "Medicine deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Get SOS Alerts History
export const handleGetSOSRequests: RequestHandler = async (req, res) => {
  try {
    const alerts = await db.emergencyRequest.findMany({
      include: {
        user: {
          include: {
            profile: true,
            medicalInfo: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
