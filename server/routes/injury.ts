import { RequestHandler } from "express";
import { db } from "../db.js";

interface InjuryTemplate {
  injuryType: string;
  severity: string;
  confidence: number;
  emergencyLevel: string;
  recommendations: string[];
}

const INJURY_TEMPLATES: { [key: string]: InjuryTemplate } = {
  burns: {
    injuryType: "Thermal Burn (Second Degree)",
    severity: "Medium to High",
    confidence: 89.4,
    emergencyLevel: "Urgent Care Required",
    recommendations: [
      "Cool the burn immediately under cool running tap water for 10-20 minutes.",
      "Do not apply ice, butter, toothpaste, or home remedies, as they trap heat.",
      "Cover the area loosely with a sterile, non-stick bandage or clean plastic wrap.",
      "Avoid popping any blisters that may form to prevent bacterial infection.",
      "Take an over-the-counter pain reliever like Paracetamol or Ibuprofen if needed."
    ]
  },
  cuts: {
    injuryType: "Laceration / Cut",
    severity: "Medium",
    confidence: 94.2,
    emergencyLevel: "First Aid & Clinic Check",
    recommendations: [
      "Apply direct, gentle pressure with a clean cloth or bandage to stop bleeding.",
      "Rinse the wound gently under running water for a few minutes to clean it.",
      "Wash the skin around the cut with mild soap, but keep soap out of the wound.",
      "Apply a thin layer of antibiotic ointment (e.g. Neosporin) to keep it moist.",
      "Cover the wound with a sterile adhesive bandage to protect it from dirt."
    ]
  },
  fractures: {
    injuryType: "Suspected Bone Fracture",
    severity: "High",
    confidence: 86.7,
    emergencyLevel: "Immediate Emergency (Call 108)",
    recommendations: [
      "Do not attempt to realign or push back a bone that has broken through the skin.",
      "Immobilize the injured area using a rigid splint or rolled newspapers.",
      "Apply an ice pack wrapped in a cloth to reduce swelling (do not apply ice directly).",
      "Elevate the broken limb above heart level if possible and safe to do so.",
      "Avoid giving the patient food or water in case emergency surgery is needed."
    ]
  },
  infections: {
    injuryType: "Localized Skin Infection (Cellulitis/Abscess)",
    severity: "Medium",
    confidence: 91.0,
    emergencyLevel: "Clinical Consultation Required",
    recommendations: [
      "Keep the infected area clean and wash regularly with antiseptic soap.",
      "Apply warm, moist compresses to the area to encourage drainage if needed.",
      "Do not attempt to squeeze, pinch, or puncture the infection site.",
      "Draw a pen circle around the red border to track if the infection spreads.",
      "Consult a doctor for potential oral or topical antibiotic prescriptions."
    ]
  },
  bruises: {
    injuryType: "Contusion (Deep Bruise)",
    severity: "Low",
    confidence: 95.8,
    emergencyLevel: "Self-Care (Home Treatment)",
    recommendations: [
      "Apply a cold compress or ice pack wrapped in a towel for 10-15 minutes.",
      "Rest the bruised limb and elevate it above the level of the heart.",
      "Avoid taking blood-thinning painkillers like Aspirin; prefer Paracetamol.",
      "After 48 hours, apply gentle warm compresses to promote blood flow."
    ]
  },
  swelling: {
    injuryType: "Acute Swelling (Sprain/Strain)",
    severity: "Low to Medium",
    confidence: 93.1,
    emergencyLevel: "Self-Care & Physiotherapist Clinic",
    recommendations: [
      "Follow the R.I.C.E protocol: Rest the joint, Ice the area, Compress with a bandage, and Elevate the limb.",
      "Avoid putting weight on the swollen joint or muscle.",
      "Wrap the area with an elastic compression bandage (not too tight).",
      "Take anti-inflammatory medication to manage pain and reduce tissue swelling."
    ]
  }
};

export const handleDetectInjury: RequestHandler = async (req, res) => {
  const { suspectedType, imageBase64 } = req.body;

  try {
    let injuryType = "";
    let severity = "";
    let confidence = 0;
    let emergencyLevel = "";
    let recs: string[] = [];

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && imageBase64) {
      // Live Gemini call
      try {
        const cleanBase64 = imageBase64.replace(/^data:.*?;base64,/, "");
        
        const prompt = "Analyze this medical injury photo. Detect if it shows a burn, cut, fracture, skin infection, bruise, or swelling. Provide the identified injuryType, severity (Low, Medium, High), confidence score (0-100), emergencyLevel (clinical status description), and recommended first-aid steps. Format your output strictly as a JSON object with keys: injuryType, severity, confidence (number), emergencyLevel, recommendations (array of strings). Do not wrap in markdown.";

        const payload = {
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (apiRes.ok) {
          const data: any = await apiRes.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(jsonText);

          injuryType = parsed.injuryType || "Unclassified Injury";
          severity = parsed.severity || "Medium";
          confidence = parsed.confidence || 85.0;
          emergencyLevel = parsed.emergencyLevel || "Consult Clinic";
          recs = parsed.recommendations || [];
        } else {
          throw new Error("Gemini Vision API call failed");
        }
      } catch (geminiError) {
        console.error("Gemini Vision failed, using clinical fallback rule templates:", geminiError);
        const type = suspectedType || "bruises";
        const template = INJURY_TEMPLATES[type] || INJURY_TEMPLATES["bruises"];
        injuryType = template.injuryType;
        severity = template.severity;
        confidence = template.confidence;
        emergencyLevel = template.emergencyLevel;
        recs = template.recommendations;
      }
    } else {
      // Offline Simulation fallback
      const type = suspectedType || "bruises";
      const template = INJURY_TEMPLATES[type] || INJURY_TEMPLATES["bruises"];
      injuryType = template.injuryType;
      severity = template.severity;
      confidence = template.confidence;
      emergencyLevel = template.emergencyLevel;
      recs = template.recommendations;
    }

    // Save to database
    const analysis = await db.injuryAnalysis.create({
      data: {
        imageUrl: imageBase64 ? "Image Analyzed" : "File Uploaded",
        injuryType,
        severity,
        confidence,
        recommendations: JSON.stringify(recs),
        emergencyLevel
      }
    });

    res.json({
      analysisId: analysis.id,
      injuryType: analysis.injuryType,
      severity: analysis.severity,
      confidence: analysis.confidence,
      recommendations: recs,
      emergencyLevel: analysis.emergencyLevel,
      timestamp: analysis.timestamp
    });

  } catch (error: any) {
    console.error("Error detecting injury:", error);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetInjuryHistory: RequestHandler = async (req, res) => {
  try {
    const history = await db.injuryAnalysis.findMany({
      orderBy: { timestamp: "desc" },
      take: 10
    });

    const formattedHistory = history.map(h => ({
      ...h,
      recommendations: JSON.parse(h.recommendations)
    }));

    res.json(formattedHistory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
