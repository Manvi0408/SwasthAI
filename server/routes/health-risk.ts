import { RequestHandler } from "express";
import { db } from "../db.js";

export const handleCreateAssessment: RequestHandler = async (req, res) => {
  const {
    age,
    height, // in cm
    weight, // in kg
    bloodPressure, // e.g. "120/80"
    diabetes, // boolean
    smoking, // boolean
    alcohol, // boolean
    familyHistory, // e.g., "None", "Diabetes", "Heart Disease", "Stroke", "Multiple"
    activityLevel // e.g., "Sedentary", "Light", "Moderate", "Active"
  } = req.body;

  if (age === undefined || height === undefined || weight === undefined || !bloodPressure) {
    res.status(400).json({ error: "Missing required assessment metrics" });
    return;
  }

  try {
    // 1. Calculate BMI
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Parse Blood Pressure (Systolic/Diastolic)
    const bpParts = bloodPressure.split("/");
    const systolic = parseInt(bpParts[0]) || 120;
    const diastolic = parseInt(bpParts[1]) || 80;
    const hasHighBP = systolic > 130 || diastolic > 85;

    // 2. Predict Diabetes Risk
    let diabetesRisk = 5.0; // base percentage
    if (familyHistory.toLowerCase().includes("diabetes") || familyHistory.toLowerCase().includes("multiple")) {
      diabetesRisk += 25.0;
    }
    if (age > 45) diabetesRisk += 20.0;
    else if (age > 30) diabetesRisk += 10.0;
    if (bmi > 30) diabetesRisk += 30.0;
    else if (bmi > 25) diabetesRisk += 15.0;
    if (activityLevel.toLowerCase() === "sedentary") diabetesRisk += 15.0;
    else if (activityLevel.toLowerCase() === "active") diabetesRisk -= 5.0;
    diabetesRisk = Math.max(2.0, Math.min(95.0, diabetesRisk));

    // 3. Predict Heart Disease Risk
    let heartDiseaseRisk = 5.0; // base percentage
    if (smoking) heartDiseaseRisk += 25.0;
    if (diabetes) heartDiseaseRisk += 20.0;
    if (hasHighBP) heartDiseaseRisk += 20.0;
    if (age > 50) heartDiseaseRisk += 15.0;
    if (familyHistory.toLowerCase().includes("heart") || familyHistory.toLowerCase().includes("multiple")) {
      heartDiseaseRisk += 20.0;
    }
    if (bmi > 27) heartDiseaseRisk += 10.0;
    heartDiseaseRisk = Math.max(2.0, Math.min(95.0, heartDiseaseRisk));

    // 4. Predict Stroke Risk
    let strokeRisk = 3.0; // base percentage
    if (hasHighBP) strokeRisk += 35.0;
    if (smoking) strokeRisk += 15.0;
    if (alcohol) strokeRisk += 10.0;
    if (age > 60) strokeRisk += 25.0;
    else if (age > 45) strokeRisk += 10.0;
    if (familyHistory.toLowerCase().includes("stroke") || familyHistory.toLowerCase().includes("multiple")) {
      strokeRisk += 15.0;
    }
    strokeRisk = Math.max(1.0, Math.min(95.0, strokeRisk));

    // 5. Overall Risk Score and Category
    const riskScore = parseFloat(((diabetesRisk + heartDiseaseRisk + strokeRisk) / 3).toFixed(1));
    let riskCategory = "Low";
    if (riskScore > 50 || diabetesRisk > 60 || heartDiseaseRisk > 60 || strokeRisk > 60) {
      riskCategory = "High";
    } else if (riskScore > 20 || diabetesRisk > 30 || heartDiseaseRisk > 30 || strokeRisk > 30) {
      riskCategory = "Medium";
    }

    // 6. Generate Recommendations and Lifestyle Suggestions
    const recs: string[] = [];
    const lifestyle: string[] = [];

    // Blood Pressure Recommendations
    if (hasHighBP) {
      recs.push("Schedule a blood pressure consultation with a primary care physician.");
      recs.push("Initiate daily blood pressure monitoring and record readings.");
      lifestyle.push("Dramatically reduce dietary sodium intake (below 1,500 mg per day).");
    }

    // Diabetes Recommendations
    if (diabetesRisk > 40) {
      recs.push("Get a Fasting Blood Glucose and HbA1c screening test immediately.");
      recs.push("Consult an endocrinologist for a comprehensive metabolic panel check.");
      lifestyle.push("Adopt a low-glycemic load diet and limit refined sugars/carbohydrates.");
    }

    // Heart Disease Recommendations
    if (heartDiseaseRisk > 40) {
      recs.push("Request an Electrocardiogram (ECG) and lipid profile blood panel.");
      recs.push("Consult a cardiologist if experiencing chest tightness or breathing shortness.");
      lifestyle.push("Incorporate 30 minutes of moderate-intensity aerobic exercise, 5 days a week.");
    }

    // Stroke Recommendations
    if (strokeRisk > 40) {
      recs.push("Discuss carotid artery screening options with a physician if age > 50.");
      lifestyle.push("Eliminate alcohol intake and strictly avoid smoking.");
    }

    // General default recommendations
    if (recs.length === 0) {
      recs.push("Maintain annual routine wellness checkups with a general physician.");
      recs.push("Complete baseline blood tests yearly (CBC, lipid profile, thyroid).");
    }
    if (lifestyle.length === 0) {
      lifestyle.push("Maintain a balanced diet rich in leafy greens, whole grains, and lean proteins.");
      lifestyle.push("Keep hydration high (minimum 2.5 - 3 liters of water daily).");
      lifestyle.push("Aim for 7 to 8 hours of quality restorative sleep nightly.");
    }

    // Save to Database
    const assessment = await db.healthRiskAssessment.create({
      data: {
        age: parseInt(String(age)),
        height: parseFloat(String(height)),
        weight: parseFloat(String(weight)),
        bmi,
        bloodPressure,
        diabetes: !!diabetes,
        smoking: !!smoking,
        alcohol: !!alcohol,
        familyHistory,
        activityLevel,
        heartDiseaseRisk,
        strokeRisk,
        diabetesRisk,
        riskScore,
        riskCategory,
        recommendations: JSON.stringify(recs),
        lifestyleSuggestions: JSON.stringify(lifestyle)
      }
    });

    res.json({
      assessmentId: assessment.id,
      bmi,
      diabetesRisk,
      heartDiseaseRisk,
      strokeRisk,
      riskScore,
      riskCategory,
      recommendations: recs,
      lifestyleSuggestions: lifestyle,
      timestamp: assessment.timestamp
    });

  } catch (error: any) {
    console.error("Error creating health risk assessment:", error);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetAssessmentHistory: RequestHandler = async (req, res) => {
  try {
    const assessments = await db.healthRiskAssessment.findMany({
      orderBy: { timestamp: "desc" },
      take: 20
    });

    const parsedAssessments = assessments.map(a => ({
      ...a,
      recommendations: JSON.parse(a.recommendations),
      lifestyleSuggestions: JSON.parse(a.lifestyleSuggestions)
    }));

    res.json(parsedAssessments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
