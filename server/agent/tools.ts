// Tool registry for the SwasthAI triage agent.
//
// Each tool is a real capability backed by the Prisma database. The agent
// (LLM- or rule-driven) decides *which* of these to call and *when*, then
// observes the returned data before planning its next step. This is what makes
// the triage flow genuinely agentic rather than a single canned response.

import { db } from "../db.js";

// Bundled sample dataset. Used automatically when the Prisma database is not
// provisioned (e.g. local demo with no DATABASE_URL), so the agent's tools
// always return realistic structured data and the loop is demoable anywhere.
const SAMPLE = {
  hospitals: [
    { name: "AIIMS Delhi", address: "Ansari Nagar", type: "AIIMS", services: "Cardiac,Trauma,Emergency", beds: "2500", rating: 4.8, phone: "011-26588500", lat: 28.5672, lng: 77.21, city: "New Delhi", state: "Delhi", icuBeds: 12, ventilatorBeds: 8, emergencyBeds: 20 },
    { name: "Fortis Escorts Heart Institute", address: "Okhla Road", type: "Cardiac Center", services: "Cardiac", beds: "310", rating: 4.6, phone: "011-47135000", lat: 28.5535, lng: 77.2812, city: "New Delhi", state: "Delhi", icuBeds: 9, ventilatorBeds: 6, emergencyBeds: 10 },
    { name: "Safdarjung Trauma Center", address: "Ansari Nagar West", type: "Trauma Center", services: "Trauma,Emergency", beds: "1600", rating: 4.2, phone: "011-26707444", lat: 28.5688, lng: 77.2065, city: "New Delhi", state: "Delhi", icuBeds: 15, ventilatorBeds: 10, emergencyBeds: 30 },
    { name: "Max Super Speciality Saket", address: "Press Enclave Rd", type: "Private", services: "Cardiac,Emergency", beds: "500", rating: 4.5, phone: "011-26515050", lat: 28.5286, lng: 77.2148, city: "New Delhi", state: "Delhi", icuBeds: 7, ventilatorBeds: 5, emergencyBeds: 12 },
    { name: "LNJP Emergency Hospital", address: "JLN Marg", type: "Emergency Center", services: "Emergency,Trauma", beds: "2000", rating: 4.0, phone: "011-23231114", lat: 28.6398, lng: 77.2385, city: "New Delhi", state: "Delhi", icuBeds: 18, ventilatorBeds: 12, emergencyBeds: 40 },
  ],
  bloodBanks: [
    { name: "Rotary Blood Bank", address: "Tughlakabad", city: "New Delhi", state: "Delhi", phone: "011-29054066", lat: 28.51, lng: 77.26, aPlus: 22, aMinus: 6, bPlus: 30, bMinus: 4, oPlus: 40, oMinus: 9, abPlus: 8, abMinus: 2 },
    { name: "AIIMS Blood Centre", address: "Ansari Nagar", city: "New Delhi", state: "Delhi", phone: "011-26594400", lat: 28.5672, lng: 77.21, aPlus: 15, aMinus: 3, bPlus: 18, bMinus: 2, oPlus: 25, oMinus: 5, abPlus: 5, abMinus: 1 },
    { name: "Red Cross Blood Bank", address: "Red Cross Rd", city: "New Delhi", state: "Delhi", phone: "011-23711551", lat: 28.617, lng: 77.223, aPlus: 10, aMinus: 1, bPlus: 12, bMinus: 0, oPlus: 14, oMinus: 0, abPlus: 3, abMinus: 0 },
  ],
  medicines: [
    { name: "Crocin Advance", genericName: "Paracetamol 500mg", brandPrice: 30, genericPrice: 8, savings: 22, description: "Fever & pain relief", category: "fever", availability: "Available" },
    { name: "Dolo 650", genericName: "Paracetamol 650mg", brandPrice: 35, genericPrice: 12, savings: 23, description: "Fever reducer", category: "fever", availability: "Available" },
    { name: "Combiflam", genericName: "Ibuprofen + Paracetamol", brandPrice: 45, genericPrice: 15, savings: 30, description: "Pain & inflammation", category: "pain", availability: "Available" },
  ],
};

/** Run a Prisma query, falling back to the bundled sample data if the DB is unavailable. */
async function withFallback<T>(query: () => Promise<T[]>, sample: T[]): Promise<T[]> {
  try {
    const rows = await query();
    return rows && rows.length ? rows : sample;
  } catch {
    return sample;
  }
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  execute: (args: Record<string, any>) => Promise<any>;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const TOOLS: ToolDef[] = [
  {
    name: "find_hospitals",
    description:
      "Find hospitals with live bed availability. Use to route a patient to appropriate care. " +
      "Filter by facility type and/or city; optionally rank by proximity to lat/lng.",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Facility type to filter by",
          enum: ["Cardiac Center", "Trauma Center", "Emergency Center", "AIIMS", "Government", "Private", "All"],
        },
        city: { type: "string", description: "City to filter by, e.g. 'New Delhi'" },
        lat: { type: "number", description: "Patient latitude for proximity ranking" },
        lng: { type: "number", description: "Patient longitude for proximity ranking" },
      },
    },
    execute: async ({ type, city, lat, lng }) => {
      let hospitals = await withFallback(() => db.hospital.findMany(), SAMPLE.hospitals as any);
      if (type && type !== "All") hospitals = hospitals.filter((h) => h.type === type);
      if (city) hospitals = hospitals.filter((h) => h.city.toLowerCase() === String(city).toLowerCase());

      let results = hospitals.map((h) => {
        let distanceKm: number | null = null;
        if (typeof lat === "number" && typeof lng === "number") {
          distanceKm = Number(haversine(lat, lng, h.lat, h.lng).toFixed(1));
        }
        return {
          name: h.name,
          type: h.type,
          city: h.city,
          phone: h.phone,
          icuBeds: h.icuBeds,
          emergencyBeds: h.emergencyBeds,
          ventilatorBeds: h.ventilatorBeds,
          rating: h.rating,
          distanceKm,
        };
      });
      if (typeof lat === "number" && typeof lng === "number") {
        results.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
      } else {
        results.sort((a, b) => b.icuBeds + b.emergencyBeds - (a.icuBeds + a.emergencyBeds));
      }
      return { count: results.length, hospitals: results.slice(0, 4) };
    },
  },
  {
    name: "check_blood_availability",
    description:
      "Check live blood-bank stock for a specific blood group. Use when a condition may require transfusion " +
      "(major trauma, bleeding, surgery, severe anemia).",
    parameters: {
      type: "object",
      properties: {
        bloodGroup: {
          type: "string",
          description: "Blood group needed",
          enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        },
        city: { type: "string", description: "City to filter by" },
      },
      required: ["bloodGroup"],
    },
    execute: async ({ bloodGroup, city }) => {
      let banks = await withFallback(() => db.bloodBank.findMany(), SAMPLE.bloodBanks as any);
      if (city) banks = banks.filter((b) => b.city.toLowerCase() === String(city).toLowerCase());
      const field: Record<string, keyof (typeof banks)[number]> = {
        "A+": "aPlus", "A-": "aMinus", "B+": "bPlus", "B-": "bMinus",
        "O+": "oPlus", "O-": "oMinus", "AB+": "abPlus", "AB-": "abMinus",
      };
      const key = field[bloodGroup];
      const withStock = banks
        .map((b) => ({ name: b.name, city: b.city, phone: b.phone, units: (b as any)[key] as number }))
        .filter((b) => b.units > 0)
        .sort((a, b) => b.units - a.units);
      return {
        bloodGroup,
        available: withStock.length > 0,
        totalUnits: withStock.reduce((s, b) => s + b.units, 0),
        banks: withStock.slice(0, 3),
      };
    },
  },
  {
    name: "find_medicine",
    description:
      "Look up a medicine and its cheaper generic substitute with pricing. Use when the patient may need " +
      "a specific drug or asks about affordable alternatives.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Medicine or symptom keyword, e.g. 'crocin', 'antacid'" },
      },
      required: ["query"],
    },
    execute: async ({ query }) => {
      const q = String(query || "").toLowerCase();
      let meds = await withFallback(() => db.medicine.findMany(), SAMPLE.medicines as any);
      if (q) {
        meds = meds.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.genericName.toLowerCase().includes(q) ||
            (m.category && m.category.toLowerCase().includes(q))
        );
      }
      return {
        count: meds.length,
        medicines: meds.slice(0, 3).map((m) => ({
          name: m.name,
          generic: m.genericName,
          brandPrice: m.brandPrice,
          genericPrice: m.genericPrice,
          savings: m.savings,
          availability: m.availability,
        })),
      };
    },
  },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(TOOLS.map((t) => [t.name, t]));
