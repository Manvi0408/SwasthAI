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
  const { query, type, lat, lng } = req.query;

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

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
