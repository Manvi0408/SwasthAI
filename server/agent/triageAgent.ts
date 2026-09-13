// SwasthAI Triage Agent
// ----------------------
// A genuine agentic loop: the agent forms a plan, calls real tools against the
// live database, observes the results, and re-plans before producing a final
// routing decision. Two interchangeable backends:
//
//   1. LLM backend (Gemini function-calling) — used when GEMINI_API_KEY is set.
//      The model autonomously decides which tools to call and iterates.
//   2. Deterministic reasoner — used as a safe, always-available fallback.
//      It still runs a real plan -> act -> observe -> re-plan loop and calls
//      the same live tools, so the demo never depends on network/keys.
//
// Both backends emit a structured `trace` so the UI can render the reasoning
// live, and both return real resource data pulled from the tools.

import { TOOLS, TOOL_MAP } from "./tools.js";
import { wrapUntrusted, detectInjection } from "../security/guard.js";

export interface TraceStep {
  kind: "thought" | "tool_call" | "observation" | "final";
  text?: string;
  tool?: string;
  args?: Record<string, any>;
  summary?: string;
}

export interface Condition {
  name: string;
  likelihood: string;
  description: string;
}

export interface AgentResult {
  severity: "High" | "Medium" | "Low";
  category: "cardiac" | "stroke" | "trauma" | "infection" | "general";
  possibleConditions: Condition[];
  action: string;
  hospitalType: string;
  trace: TraceStep[];
  resources: {
    hospitals?: any;
    blood?: any;
    medicine?: any;
  };
  engine: "gemini" | "deterministic";
  guard: { injectionFlagged: boolean; matches: string[] };
}

interface Classification {
  severity: "High" | "Medium" | "Low";
  category: "cardiac" | "stroke" | "trauma" | "infection" | "general";
  conditions: Condition[];
  action: string;
  hospitalType: string;
  bloodLikely: boolean;
  bloodGroupGuess?: string;
}

// Shared clinical classifier used to seed both backends. Keeps severity/action
// deterministic (patient safety) while the *agentic* work is the tool-driven
// resource routing on top of it.
function classify(symptoms: string): Classification {
  const s = symptoms.toLowerCase();
  if (/(chest pain|chest[\w\s]{0,15}tight|tight[\w\s]{0,10}chest|heart attack|palpitation|shortness of breath|short of breath|can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|breathing difficulty|gasping|choking)/.test(s)) {
    return {
      severity: "High",
      category: "cardiac",
      hospitalType: "Cardiac Centers",
      action: "EMERGENCY: Call 108 immediately or go to the nearest Cardiac Center. Do not drive yourself.",
      bloodLikely: false,
      conditions: [
        { name: "Myocardial Infarction (Heart Attack)", likelihood: "High", description: "Inadequate oxygen supply to heart muscle due to blocked coronary arteries." },
        { name: "Pulmonary Embolism", likelihood: "Medium", description: "Blood clot blocking blood flow to the lungs." },
      ],
    };
  }
  if (/(stroke|numb|slurred speech|difficulty speaking|facial droop|face[\w\s]{0,10}droop|droop[\w\s]{0,10}face|arm weakness|weak[\w\s]{0,10}arm|arm[\w\s]{0,10}weak|one side[\w\s]{0,20}weak)/.test(s)) {
    return {
      severity: "High",
      category: "stroke",
      hospitalType: "Trauma Centers",
      action: "EMERGENCY: Time is brain. Call 108 or proceed immediately to the nearest Trauma Center.",
      bloodLikely: false,
      conditions: [
        { name: "Acute Ischemic Stroke", likelihood: "High", description: "Sudden interruption of blood supply to part of the brain." },
        { name: "Transient Ischemic Attack", likelihood: "Medium", description: "Temporary block of blood flow to the brain, warning of a full stroke." },
      ],
    };
  }
  if (/(accident|bleeding|blood loss|fracture|broken bone|trauma|wound|unconscious|poison|burn|fell from|deep cut)/.test(s)) {
    return {
      severity: "High",
      category: "trauma",
      hospitalType: "Trauma Centers",
      action: "EMERGENCY: Administer first-aid if trained, call 108, and transport to the nearest Trauma/Emergency Hospital.",
      bloodLikely: /(bleeding|blood loss|accident|trauma|surgery)/.test(s),
      bloodGroupGuess: "O-",
      conditions: [
        { name: "Acute Physical Trauma / Toxicity", likelihood: "High", description: "Severe bodily injury or chemical exposure leading to systemic damage." },
      ],
    };
  }
  if (/(fever|infection|cough|flu|vomiting|diarrhea|cold|sore throat|body ache|runny nose)/.test(s)) {
    return {
      severity: "Medium",
      category: "infection",
      hospitalType: "Government Hospitals",
      action: "Urgent consultation: Visit a general physician or outpatient department within 24 hours.",
      bloodLikely: false,
      conditions: [
        { name: "Viral / Bacterial Infection or Flu", likelihood: "High", description: "Infection of the respiratory or digestive tract causing fever and fluid loss." },
      ],
    };
  }
  return {
    severity: "Low",
    category: "general",
    hospitalType: "Government Hospitals",
    action: "Monitor symptoms, rest, and keep hydrated. Consult a local clinic if symptoms persist.",
    bloodLikely: false,
    conditions: [
      { name: "Common Malaise / Tension Symptoms", likelihood: "High", description: "Mild temporary dysfunction due to stress, fatigue, or minor irritation." },
    ],
  };
}

// ---------------------------------------------------------------------------
// Deterministic reasoner (always available)
// ---------------------------------------------------------------------------
async function runDeterministic(
  symptoms: string,
  ctx: { city?: string; lat?: number; lng?: number },
  guard: { injectionFlagged: boolean; matches: string[] }
): Promise<AgentResult> {
  const c = classify(symptoms);
  const trace: TraceStep[] = [];
  const resources: AgentResult["resources"] = {};

  trace.push({
    kind: "thought",
    text: `Assessed symptoms as ${c.severity} severity (${c.category}). Planning resource lookups to route the patient.`,
  });

  // Step: find hospitals of the right type.
  const hospitalType =
    c.category === "cardiac" ? "Cardiac Center" : c.category === "stroke" || c.category === "trauma" ? "Trauma Center" : c.category === "infection" ? "Government" : "All";
  const hArgs = { type: hospitalType, city: ctx.city, lat: ctx.lat, lng: ctx.lng };
  trace.push({ kind: "tool_call", tool: "find_hospitals", args: hArgs });
  const hospitals = await TOOL_MAP.find_hospitals.execute(hArgs);
  resources.hospitals = hospitals;
  const top = hospitals.hospitals?.[0];
  trace.push({
    kind: "observation",
    tool: "find_hospitals",
    summary: top
      ? `${hospitals.count} matching facilities. Best: ${top.name} (${top.icuBeds} ICU / ${top.emergencyBeds} ER beds${top.distanceKm != null ? `, ${top.distanceKm} km` : ""}).`
      : `No ${hospitalType} facilities found; will fall back to nearest general hospital.`,
  });

  // Re-plan: if no matching facility was found, broaden the search so the
  // patient is always routed somewhere (emergency-capable for High acuity,
  // any nearby hospital otherwise).
  if (!top) {
    const fallbackType = c.severity === "High" ? "Emergency Center" : "All";
    trace.push({ kind: "thought", text: `No matching facility available — re-planning to search ${fallbackType === "All" ? "all nearby hospitals" : "emergency-capable hospitals"}.` });
    const fbArgs = { type: fallbackType, city: ctx.city, lat: ctx.lat, lng: ctx.lng };
    trace.push({ kind: "tool_call", tool: "find_hospitals", args: fbArgs });
    const fb = await TOOL_MAP.find_hospitals.execute(fbArgs);
    resources.hospitals = fb;
    trace.push({ kind: "observation", tool: "find_hospitals", summary: `${fb.count} facilities found on fallback search.` });
  }

  // Step: blood availability when clinically indicated.
  if (c.bloodLikely) {
    const bArgs = { bloodGroup: c.bloodGroupGuess || "O-", city: ctx.city };
    trace.push({ kind: "thought", text: "Condition may require transfusion — checking live blood-bank stock." });
    trace.push({ kind: "tool_call", tool: "check_blood_availability", args: bArgs });
    const blood = await TOOL_MAP.check_blood_availability.execute(bArgs);
    resources.blood = blood;
    trace.push({
      kind: "observation",
      tool: "check_blood_availability",
      summary: blood.available
        ? `${bArgs.bloodGroup} available — ${blood.totalUnits} units across ${blood.banks.length} bank(s).`
        : `No ${bArgs.bloodGroup} stock nearby — flag for regional blood coordination.`,
    });
  }

  // Step: medicine guidance for low/medium self-care cases.
  if (c.severity !== "High") {
    const q = c.category === "infection" ? "fever" : "pain";
    const mArgs = { query: q };
    trace.push({ kind: "tool_call", tool: "find_medicine", args: mArgs });
    const medicine = await TOOL_MAP.find_medicine.execute(mArgs);
    resources.medicine = medicine;
    trace.push({
      kind: "observation",
      tool: "find_medicine",
      summary: medicine.count ? `${medicine.count} options; cheapest generic saves up to ₹${medicine.medicines[0]?.savings ?? 0}.` : "No matching medicines found.",
    });
  }

  const best = resources.hospitals?.hospitals?.[0];
  const finalText = best
    ? `Route to ${best.name} (${best.type}). ${best.icuBeds} ICU / ${best.emergencyBeds} ER beds available${best.distanceKm != null ? `, ${best.distanceKm} km away` : ""}. Call ${best.phone}. ${c.action}`
    : c.action;
  trace.push({ kind: "final", text: finalText });

  return {
    severity: c.severity,
    category: c.category,
    possibleConditions: c.conditions,
    action: finalText,
    hospitalType: c.hospitalType,
    trace,
    resources,
    engine: "deterministic",
    guard,
  };
}

// ---------------------------------------------------------------------------
// Gemini function-calling backend (used when GEMINI_API_KEY is present)
// ---------------------------------------------------------------------------
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function runGemini(
  symptoms: string,
  ctx: { city?: string; lat?: number; lng?: number },
  apiKey: string,
  guard: { injectionFlagged: boolean; matches: string[] }
): Promise<AgentResult> {
  const c = classify(symptoms); // safety baseline for severity/conditions
  const trace: TraceStep[] = [];
  const resources: AgentResult["resources"] = {};

  const systemInstruction = {
    role: "user",
    parts: [
      {
        text:
          "You are SwasthAI's emergency triage agent for India. Decide which tools to call to route the patient to the right live medical resources (hospitals with beds, blood banks, medicines). " +
          "Call tools as needed, observe results, then give a concise routing recommendation. Never invent bed counts or stock — only use tool results. " +
          "Emergency numbers: 108 (ambulance). Always be safety-first.\n\n" +
          (ctx.city ? `Patient city: ${ctx.city}. ` : "") +
          (typeof ctx.lat === "number" ? `Patient location: ${ctx.lat},${ctx.lng}. ` : "") +
          wrapUntrusted("patient symptom description", symptoms),
      },
    ],
  };

  const functionDeclarations = TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));

  const contents: any[] = [systemInstruction];
  const MAX_STEPS = 5;

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, // key in header, never URL
      body: JSON.stringify({ contents, tools: [{ functionDeclarations }] }),
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data: any = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const calls = parts.filter((p: any) => p.functionCall);

    if (calls.length === 0) {
      const finalText = parts.map((p: any) => p.text).filter(Boolean).join(" ").trim();
      trace.push({ kind: "final", text: finalText || c.action });
      break;
    }

    // Record model turn, then execute each requested tool.
    contents.push({ role: "model", parts });
    const responseParts: any[] = [];
    for (const p of calls) {
      const { name, args } = p.functionCall;
      const tool = TOOL_MAP[name];
      trace.push({ kind: "tool_call", tool: name, args });
      let result: any;
      try {
        result = tool ? await tool.execute(args || {}) : { error: `unknown tool ${name}` };
      } catch (e: any) {
        result = { error: e.message };
      }
      (resources as any)[name.replace("find_", "").replace("check_", "").replace("_availability", "").replace("hospitals", "hospitals")] = result;
      if (name === "find_hospitals") resources.hospitals = result;
      if (name === "check_blood_availability") resources.blood = result;
      if (name === "find_medicine") resources.medicine = result;
      trace.push({ kind: "observation", tool: name, summary: summarize(name, result) });
      responseParts.push({ functionResponse: { name, response: { result } } });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  if (!trace.some((t) => t.kind === "final")) trace.push({ kind: "final", text: c.action });

  return {
    severity: c.severity,
    category: c.category,
    possibleConditions: c.conditions,
    action: trace.find((t) => t.kind === "final")?.text || c.action,
    hospitalType: c.hospitalType,
    trace,
    resources,
    engine: "gemini",
    guard,
  };
}

function summarize(tool: string, r: any): string {
  if (!r || r.error) return `Tool error: ${r?.error ?? "unknown"}`;
  if (tool === "find_hospitals") return `${r.count} facilities; top: ${r.hospitals?.[0]?.name ?? "none"}.`;
  if (tool === "check_blood_availability") return r.available ? `${r.bloodGroup}: ${r.totalUnits} units.` : `${r.bloodGroup}: none nearby.`;
  if (tool === "find_medicine") return `${r.count} medicine option(s).`;
  return "Observation recorded.";
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
export async function runTriageAgent(
  symptoms: string,
  ctx: { city?: string; lat?: number; lng?: number } = {}
): Promise<AgentResult> {
  const scan = detectInjection(symptoms);
  const guard = { injectionFlagged: scan.flagged, matches: scan.matches };

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await runGemini(symptoms, ctx, apiKey, guard);
    } catch (e) {
      console.error("Gemini agent failed, falling back to deterministic reasoner:", e);
    }
  }
  return runDeterministic(symptoms, ctx, guard);
}
