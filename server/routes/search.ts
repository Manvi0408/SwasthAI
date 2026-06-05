import { RequestHandler } from "express";
import { db } from "../db.js";

// Symptoms classification rules (same logic as triage.ts)
const getTriageResult = (query: string) => {
  const q = query.toLowerCase();
  
  if (
    q.includes("chest pain") ||
    q.includes("heart") ||
    q.includes("breathing difficulty") ||
    q.includes("shortness of breath") ||
    q.includes("choking")
  ) {
    return {
      match: true,
      severity: "High",
      condition: "Myocardial Infarction (Heart Attack) / Pulmonary Embolism",
      action: "EMERGENCY: Call 108 immediately or go to the nearest Cardiac Center. Do not drive yourself.",
      hospitalType: "Cardiac Centers",
    };
  }
  
  if (
    q.includes("stroke") ||
    q.includes("numbness") ||
    q.includes("slurred speech") ||
    q.includes("facial droop") ||
    q.includes("weakness")
  ) {
    return {
      match: true,
      severity: "High",
      condition: "Acute Ischemic Stroke / Transient Ischemic Attack",
      action: "EMERGENCY: Time is brain. Call 108 or proceed immediately to the nearest Trauma Center.",
      hospitalType: "Trauma Centers",
    };
  }
  
  if (
    q.includes("poison") ||
    q.includes("burn") ||
    q.includes("accident") ||
    q.includes("bleeding") ||
    q.includes("unconscious")
  ) {
    return {
      match: true,
      severity: "High",
      condition: "Acute Physical Trauma / Toxicity",
      action: "EMERGENCY: Administer first-aid if trained, call 108, and transport to the nearest Trauma/Emergency Hospital.",
      hospitalType: "Trauma Centers",
    };
  }
  
  if (
    q.includes("fever") ||
    q.includes("infection") ||
    q.includes("cough") ||
    q.includes("flu") ||
    q.includes("vomiting") ||
    q.includes("diarrhea")
  ) {
    return {
      match: true,
      severity: "Medium",
      condition: "Viral/Bacterial Infection or Flu",
      action: "Urgent consultation: Visit a general physician or outpatient department within 24 hours.",
      hospitalType: "Government Hospitals",
    };
  }

  if (
    q.includes("headache") ||
    q.includes("dizzy") ||
    q.includes("cold") ||
    q.includes("nausea") ||
    q.includes("stomach ache")
  ) {
    return {
      match: true,
      severity: "Low",
      condition: "Common Malaise / Tension Symptoms",
      action: "Monitor symptoms, rest, and keep hydrated. Consult a clinic if symptoms persist.",
      hospitalType: "Government Hospitals",
    };
  }

  return null;
};

// Emergency action instructions (same logic as emergency.ts)
const getEmergencyResult = (query: string) => {
  const q = query.toLowerCase();
  
  if (q.includes("heart") || q.includes("cardiac") || q.includes("chest pain")) {
    return {
      match: true,
      category: "Cardiac Emergency",
      instructions: "Sit upright. Loosen tight clothing. Chew a full aspirin (325mg) if available and not allergic.",
      dispatch: "108 (Cardiac Ambulance)",
    };
  }
  
  if (q.includes("stroke") || q.includes("paralysis")) {
    return {
      match: true,
      category: "Stroke Emergency",
      instructions: "Note the time symptoms started. Lie down on one side with head slightly elevated. Do not give foods/drinks.",
      dispatch: "108 (Stroke Trauma Unit)",
    };
  }
  
  if (q.includes("accident") || q.includes("bleeding") || q.includes("wound")) {
    return {
      match: true,
      category: "Trauma/Bleeding Emergency",
      instructions: "Apply direct firm pressure on the wound with clean cloth. Elevate the bleeding limb. Keep spine immobilized.",
      dispatch: "108 (Trauma Ambulance)",
    };
  }
  
  if (q.includes("burn") || q.includes("fire")) {
    return {
      match: true,
      category: "Burn Emergency",
      instructions: "Cool the burn with running tap water for 10-20 minutes. Do not apply ice, butter, or paste. Cover with sterile wrap.",
      dispatch: "108",
    };
  }
  
  if (q.includes("poison") || q.includes("chemical") || q.includes("toxin")) {
    return {
      match: true,
      category: "Poison Emergency",
      instructions: "Identify the poison or container. Do not induce vomiting. Keep airway clear and call poison control.",
      dispatch: "108",
    };
  }

  if (q.includes("sos") || q.includes("emergency") || q.includes("panic")) {
    return {
      match: true,
      category: "General Emergency",
      instructions: "Stay calm. Keep airway clear. Proximity responders and nearest ambulance are being notified.",
      dispatch: "108 / 112",
    };
  }

  return null;
};

// Parse blood group keywords
const parseBloodGroup = (query: string): string | null => {
  const q = query.toUpperCase().replace(/\s+/g, "");
  const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  for (const g of groups) {
    if (q.includes(g)) return g;
  }
  
  // Also match spelling representations e.g. "o positive" or "o negative"
  const textMatches: { [key: string]: string } = {
    "OPOSITIVE": "O+", "ONEGATIVE": "O-",
    "APOSITIVE": "A+", "ANEGATIVE": "A-",
    "BPOSITIVE": "B+", "BNEGATIVE": "B-",
    "ABPOSITIVE": "AB+", "ABNEGATIVE": "AB-"
  };
  
  for (const [key, val] of Object.entries(textMatches)) {
    if (q.includes(key)) return val;
  }

  return null;
};

export const handleSearch: RequestHandler = async (req, res) => {
  const query = req.query.q ? String(req.query.q).trim() : "";
  
  if (!query || query.length < 2) {
    res.json({ suggestions: [], results: { hospitals: [], bloodBanks: [], medicines: [], triage: null, emergency: null } });
    return;
  }

  try {
    const qLower = query.toLowerCase();
    
    // 1. Query Database models in parallel
    const [hospitals, bloodBanks, medicines] = await Promise.all([
      db.hospital.findMany(),
      db.bloodBank.findMany(),
      db.medicine.findMany()
    ]);

    // 2. Perform local matching (very fast for current dataset size)
    // Match hospitals
    const matchedHospitals = hospitals.filter(h => 
      h.name.toLowerCase().includes(qLower) || 
      h.address.toLowerCase().includes(qLower) || 
      h.type.toLowerCase().includes(qLower) || 
      h.services.toLowerCase().includes(qLower)
    );

    // Match medicines
    const matchedMedicines = medicines.filter(m => 
      m.name.toLowerCase().includes(qLower) || 
      m.genericName.toLowerCase().includes(qLower) || 
      (m.category && m.category.toLowerCase().includes(qLower))
    );

    // Match blood banks
    const parsedBG = parseBloodGroup(query);
    const matchedBloodBanks = bloodBanks.filter(b => {
      const cityStateMatch = b.city.toLowerCase().includes(qLower) || b.state.toLowerCase().includes(qLower) || b.name.toLowerCase().includes(qLower);
      
      if (parsedBG) {
        // If query specifically mentions a blood group, show blood banks that have stock of it
        switch (parsedBG) {
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
      }
      
      return cityStateMatch;
    });

    // Match symptoms and emergency rules
    const triageMatch = getTriageResult(query);
    const emergencyMatch = getEmergencyResult(query);

    // 3. Assemble instant autocomplete suggestions (Limit to 5 total)
    const suggestions: any[] = [];

    // Add emergency suggestions first (highest priority)
    if (emergencyMatch) {
      suggestions.push({
        type: "emergency",
        title: `Emergency Guide: ${emergencyMatch.category}`,
        description: `Immediate Action: ${emergencyMatch.instructions.substring(0, 50)}...`,
        id: "emergency_guidelines"
      });
    }

    // Add triage / symptoms suggestions
    if (triageMatch) {
      suggestions.push({
        type: "symptom",
        title: `Symptom Analysis: ${triageMatch.condition}`,
        description: `Severity: ${triageMatch.severity} - ${triageMatch.action.substring(0, 50)}...`,
        id: "symptom_triage"
      });
    }

    // Add blood group suggestions
    if (parsedBG) {
      suggestions.push({
        type: "blood_bank",
        title: `Blood Group ${parsedBG} Stock Availability`,
        description: `Find donor facilities with active ${parsedBG} units.`,
        id: `blood_group_${parsedBG}`
      });
    }

    // Add top matching hospitals
    for (const h of matchedHospitals.slice(0, 2)) {
      suggestions.push({
        type: "hospital",
        title: h.name,
        description: `${h.type} • ${h.address.substring(0, 45)}...`,
        id: h.id
      });
    }

    // Add top matching medicines
    for (const m of matchedMedicines.slice(0, 2)) {
      suggestions.push({
        type: "medicine",
        title: `${m.name} (${m.genericName})`,
        description: `${m.category || "Alternative Medicine"} • Save up to ${m.savings.toFixed(0)}%`,
        id: m.id
      });
    }

    // Also populate default suggestions if list is thin
    if (suggestions.length < 2) {
      if (qLower.includes("hos") || qLower.includes("bed") || qLower.includes("doc")) {
        suggestions.push({
          type: "hospital",
          title: "Search Nearest Hospitals",
          description: "Discover empty beds and trauma care facilities sorted by proximity.",
          id: "all_hospitals"
        });
      }
      if (qLower.includes("blo") || qLower.includes("don")) {
        suggestions.push({
          type: "blood_bank",
          title: "Blood Inventory Stock Locator",
          description: "Search local blood banks by city or blood type.",
          id: "all_blood_banks"
        });
      }
      if (qLower.includes("med") || qLower.includes("pharm") || qLower.includes("pill")) {
        suggestions.push({
          type: "medicine",
          title: "Jan Aushadhi Generic Substitute Finder",
          description: "Find cheap generic alternatives and calculate savings.",
          id: "all_medicines"
        });
      }
    }

    res.json({
      suggestions: suggestions.slice(0, 5),
      results: {
        hospitals: matchedHospitals,
        bloodBanks: matchedBloodBanks,
        medicines: matchedMedicines,
        triage: triageMatch,
        emergency: emergencyMatch
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
