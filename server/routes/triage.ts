import { RequestHandler } from "express";
import { db } from "../db.js";

export const handleTriage: RequestHandler = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    res.status(400).json({ error: "Symptoms description is required" });
    return;
  }

  const s = symptoms.toLowerCase();
  let severity = "Low";
  let action = "Monitor symptoms, rest, and keep hydrated. Consult a local clinic if symptoms persist.";
  let hospitalType = "Government Hospitals";
  let possibleConditions: { name: string; likelihood: string; description: string }[] = [];

  // Rules Engine
  if (
    s.includes("chest pain") ||
    s.includes("heart") ||
    s.includes("breathing difficulty") ||
    s.includes("shortness of breath") ||
    s.includes("choking")
  ) {
    severity = "High";
    possibleConditions = [
      {
        name: "Myocardial Infarction (Heart Attack)",
        likelihood: "High",
        description: "Inadequate oxygen supply to heart muscle due to blocked coronary arteries.",
      },
      {
        name: "Pulmonary Embolism",
        likelihood: "Medium",
        description: "Blood clot blocking blood flow to lungs.",
      },
    ];
    action = "EMERGENCY: Call 108 immediately or go to the nearest Cardiac Center. Do not drive yourself.";
    hospitalType = "Cardiac Centers";
  } else if (
    s.includes("stroke") ||
    s.includes("numbness") ||
    s.includes("slurred speech") ||
    s.includes("facial droop") ||
    s.includes("weakness in arm") ||
    s.includes("arm weakness")
  ) {
    severity = "High";
    possibleConditions = [
      {
        name: "Acute Ischemic Stroke",
        likelihood: "High",
        description: "Sudden interruption of blood supply to a part of the brain.",
      },
      {
        name: "Transient Ischemic Attack (Mini-Stroke)",
        likelihood: "Medium",
        description: "Temporary block of blood flow to the brain, warning of a full stroke.",
      },
    ];
    action = "EMERGENCY: Time is brain. Call 108 or proceed immediately to the nearest Trauma Center.";
    hospitalType = "Trauma Centers";
  } else if (
    s.includes("poison") ||
    s.includes("burn") ||
    s.includes("accident") ||
    s.includes("bleeding") ||
    s.includes("unconscious")
  ) {
    severity = "High";
    possibleConditions = [
      {
        name: "Acute Physical Trauma / Toxicity",
        likelihood: "High",
        description: "Severe bodily injury or chemical ingestion leading to systemic damage.",
      },
    ];
    action = "EMERGENCY: Administer first-aid if trained, call 108, and transport to the nearest Trauma/Emergency Hospital.";
    hospitalType = "Trauma Centers";
  } else if (
    s.includes("fever") ||
    s.includes("infection") ||
    s.includes("cough") ||
    s.includes("flu") ||
    s.includes("vomiting") ||
    s.includes("diarrhea")
  ) {
    severity = "Medium";
    possibleConditions = [
      {
        name: "Viral / Bacterial Gastroenteritis or Flu",
        likelihood: "High",
        description: "Infection of respiratory or digestive tract causing fever and fluid loss.",
      },
      {
        name: "Acute Infection",
        likelihood: "Medium",
        description: "Localized or systemic immune response requiring antibiotic or supportive treatment.",
      },
    ];
    action = "Urgent consultation: Visit a general physician or outpatient department within 24 hours.";
    hospitalType = "Government Hospitals";
  } else {
    // Default low severity
    possibleConditions = [
      {
        name: "Common Malaise / Tension Symptoms",
        likelihood: "High",
        description: "Mild temporary dysfunction due to stress, fatigue, or minor irritation.",
      },
    ];
  }

  try {
    // Log anonymously
    await db.aiTriageHistory.create({
      data: {
        symptoms,
        conditions: JSON.stringify(possibleConditions),
        severity,
        action,
        hospitalType,
      },
    });

    res.json({
      possibleConditions,
      severity,
      action,
      hospitalType,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
