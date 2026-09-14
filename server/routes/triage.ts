import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { runTriageAgent } from "../agent/triageAgent.js";
import { redactPII } from "../security/guard.js";

// Validated request shape. Location is optional and only used to rank resources.
const TriageSchema = z.object({
  symptoms: z.string().min(5, "Please describe symptoms in more detail").max(2000),
  city: z.string().max(80).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const handleTriage: RequestHandler = async (req, res) => {
  const parsed = TriageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request", code: "VALIDATION" });
    return;
  }
  const { symptoms, city, lat, lng } = parsed.data;

  try {
    // Run the agentic triage loop (LLM tool-calling or deterministic fallback).
    const result = await runTriageAgent(symptoms, { city, lat, lng });

    // Persist an anonymized record (PII stripped from the free-text symptoms).
    // Non-fatal: a missing/unprovisioned DB must not break the triage response.
    try {
      await db.aiTriageHistory.create({
        data: {
          symptoms: redactPII(symptoms).slice(0, 1000),
          conditions: JSON.stringify(result.possibleConditions),
          severity: result.severity,
          action: result.action,
          hospitalType: result.hospitalType,
        },
      });
    } catch (e) {
      console.warn("triage history persist skipped (DB unavailable)");
    }

    res.json({
      possibleConditions: result.possibleConditions,
      severity: result.severity,
      action: result.action,
      hospitalType: result.hospitalType,
      // Agentic additions:
      trace: result.trace,
      resources: result.resources,
      engine: result.engine,
      guard: result.guard,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
