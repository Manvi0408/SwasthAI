import { RequestHandler } from "express";
import { db } from "../db";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const handleEmergencySos: RequestHandler = async (req, res) => {
  const { userId, category, lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400).json({ error: "Latitude and Longitude are required for SOS" });
    return;
  }

  try {
    // 1. Create emergency request log
    const request = await db.emergencyRequest.create({
      data: {
        userId: userId && !userId.startsWith("guest_") ? userId : null,
        category: category || "General Emergency",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        status: "RESPONDING",
      },
    });

    // 2. Query nearest hospitals
    const hospitals = await db.hospital.findMany();
    let targetType = "Trauma Center";

    // Adjust target hospital type based on emergency category
    const cat = String(category).toLowerCase();
    if (cat.includes("heart") || cat.includes("cardiac") || cat.includes("stroke")) {
      targetType = "Cardiac Center";
    }

    let nearest = hospitals.filter((h) => h.type.toLowerCase().includes(targetType.toLowerCase()));
    if (nearest.length === 0) {
      nearest = hospitals; // Fallback to all hospitals
    }

    // Proximity calculation
    const mapped = nearest.map((h) => {
      const dist = getDistance(parseFloat(lat), parseFloat(lng), h.lat, h.lng);
      return {
        ...h,
        distanceVal: dist,
        distance: `${dist.toFixed(1)} km`,
      };
    });

    mapped.sort((a, b) => a.distanceVal - b.distanceVal);
    const closestHospital = mapped[0];

    // 3. Category-specific instructions
    let instructions = "Remain calm. Help is on the way.";
    if (cat.includes("heart") || cat.includes("cardiac")) {
      instructions = "Sit upright. Loosen tight clothing. Do not attempt heavy physical effort. Chew a full aspirin (325mg) if available and not allergic.";
    } else if (cat.includes("stroke")) {
      instructions = "Note the time symptoms started. Lie down on one side with head slightly elevated. Do not give foods, drinks, or medications.";
    } else if (cat.includes("accident") || cat.includes("bleeding")) {
      instructions = "Apply direct firm pressure on the wound with clean cloth. Elevate the bleeding limb. Do not move injured neck/spine unless in immediate danger.";
    } else if (cat.includes("poison")) {
      instructions = "Identify the poison or container. Do not induce vomiting unless advised by medical professionals. Keep airway clear.";
    } else if (cat.includes("burn")) {
      instructions = "Cool the burn with running tap water for 10-20 minutes. Do not apply ice, butter, or paste. Cover with sterile wrap.";
    }

    res.json({
      message: "SOS Emergency Dispatched",
      requestId: request.id,
      category: request.category,
      nearestHospital: closestHospital,
      instructions,
      dispatchContact: "108",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
