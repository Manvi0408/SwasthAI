import { RequestHandler } from "express";
import { db } from "../db.js";

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const handleGetHospitals: RequestHandler = async (req, res) => {
  const { query, type, lat, lng, userId } = req.query;

  try {
    // 1. Fetch hospitals from DB
    let hospitals = await db.hospital.findMany();

    // 2. Filter by search query
    if (query) {
      const q = String(query).toLowerCase();
      hospitals = hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.services.toLowerCase().includes(q)
      );
    }

    // 3. Filter by type
    if (type && type !== "All") {
      hospitals = hospitals.filter((h) => h.type === type);
    }

    // 4. Calculate distances if coordinates are provided
    let results = hospitals.map((h) => {
      let distance = "Coordinates not provided";
      let distanceValue = Infinity;

      if (lat && lng) {
        const uLat = parseFloat(String(lat));
        const uLng = parseFloat(String(lng));
        const dist = getHaversineDistance(uLat, uLng, h.lat, h.lng);
        distanceValue = dist;
        distance = `${dist.toFixed(1)} km`;
      }

      return {
        ...h,
        distance,
        distanceValue,
      };
    });

    // Sort by proximity if coordinates are available
    if (lat && lng) {
      results.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    // 5. Store search history in database if userId is provided
    if (userId && typeof userId === "string" && !userId.startsWith("guest_") && query) {
      await db.searchHistory.create({
        data: {
          userId,
          type: "HOSPITAL",
          query: String(query),
          filters: JSON.stringify({ type }),
        },
      });
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleSaveHospital: RequestHandler = async (req, res) => {
  const { userId, hospitalId, name, address, distance, contact, rating, services } = req.body;

  if (!userId || !hospitalId) {
    res.status(400).json({ error: "userId and hospitalId are required" });
    return;
  }

  if (userId.startsWith("guest_")) {
    res.status(400).json({ error: "Guests cannot bookmark resources" });
    return;
  }

  try {
    const existing = await db.savedHospital.findFirst({
      where: { userId, hospitalId },
    });

    if (existing) {
      res.status(400).json({ error: "Hospital already bookmarked" });
      return;
    }

    const saved = await db.savedHospital.create({
      data: {
        userId,
        hospitalId,
        name,
        address,
        distance: distance || "Unknown distance",
        contact: contact || "",
        rating: rating ? parseFloat(rating) : 4.0,
        services: services || "",
      },
    });

    res.json({ message: "Hospital bookmarked successfully", saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUnsaveHospital: RequestHandler = async (req, res) => {
  const { userId, hospitalId } = req.body;

  if (!userId || !hospitalId) {
    res.status(400).json({ error: "userId and hospitalId are required" });
    return;
  }

  try {
    await db.savedHospital.deleteMany({
      where: { userId, hospitalId },
    });
    res.json({ message: "Bookmark removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
