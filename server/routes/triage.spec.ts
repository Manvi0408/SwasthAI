import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Prisma-backed db so the triage rules engine can be tested in
// isolation (no database, no Prisma client needed).
vi.mock("../db.js", () => ({
  db: { aiTriageHistory: { create: vi.fn().mockResolvedValue({}) } },
}));

import { db } from "../db.js";
import { handleTriage } from "./triage";

function mockRes() {
  const res: any = { statusCode: 200 };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body: any) => {
    res.body = body;
    return res;
  });
  return res;
}

async function triage(symptoms?: string) {
  const req: any = { body: symptoms === undefined ? {} : { symptoms } };
  const res = mockRes();
  await handleTriage(req, res, (() => {}) as any);
  return res;
}

describe("handleTriage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a request with no symptoms", async () => {
    const res = await triage(undefined);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
    expect(db.aiTriageHistory.create).not.toHaveBeenCalled();
  });

  it("flags chest pain as High severity and routes to a Cardiac Center", async () => {
    const res = await triage("crushing chest pain and shortness of breath");
    expect(res.body.severity).toBe("High");
    expect(res.body.hospitalType).toBe("Cardiac Centers");
    expect(res.body.possibleConditions.map((c: any) => c.name)).toContain(
      "Myocardial Infarction (Heart Attack)",
    );
  });

  it("routes stroke symptoms to a Trauma Center", async () => {
    const res = await triage("sudden slurred speech and arm weakness");
    expect(res.body.severity).toBe("High");
    expect(res.body.hospitalType).toBe("Trauma Centers");
    expect(res.body.possibleConditions.map((c: any) => c.name)).toContain(
      "Acute Ischemic Stroke",
    );
  });

  it("treats trauma keywords (accident/bleeding) as High severity", async () => {
    const res = await triage("heavy bleeding after a road accident");
    expect(res.body.severity).toBe("High");
    expect(res.body.hospitalType).toBe("Trauma Centers");
  });

  it("classifies flu-like symptoms as Medium severity", async () => {
    const res = await triage("fever, cough and vomiting since yesterday");
    expect(res.body.severity).toBe("Medium");
    expect(res.body.hospitalType).toBe("Government Hospitals");
  });

  it("defaults to Low severity for non-urgent symptoms", async () => {
    const res = await triage("mild headache and slight tiredness");
    expect(res.body.severity).toBe("Low");
    expect(res.body.hospitalType).toBe("Government Hospitals");
    expect(res.body.possibleConditions.length).toBeGreaterThan(0);
  });

  it("matches keywords case-insensitively", async () => {
    const res = await triage("CHEST PAIN");
    expect(res.body.severity).toBe("High");
  });

  it("logs each assessment to the anonymous triage history", async () => {
    await triage("fever and cough");
    expect(db.aiTriageHistory.create).toHaveBeenCalledTimes(1);
    const arg = (db.aiTriageHistory.create as any).mock.calls[0][0];
    expect(arg.data.severity).toBe("Medium");
  });
});
