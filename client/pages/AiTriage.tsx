import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, AlertTriangle, Activity, Stethoscope, Info, Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Condition {
  name: string;
  likelihood: string;
  description: string;
}

interface TriageResult {
  possibleConditions: Condition[];
  severity: string;
  action: string;
  hospitalType: string;
}

export default function AiTriage() {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"symptoms" | "reports">("symptoms");

  // Tab 1: Symptoms states
  const [symptoms, setSymptoms] = useState("");
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [symptomsResult, setSymptomsResult] = useState<TriageResult | null>(null);

  // Tab 2: Report states
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportBase64, setReportBase64] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportResult, setReportResult] = useState<any | null>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  const fetchReportHistory = async () => {
    try {
      const res = await fetch("/api/medical-report/history");
      if (res.ok) {
        const data = await res.json();
        setReportHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch report history", err);
    }
  };

  useEffect(() => {
    fetchReportHistory();
  }, []);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms || symptoms.length < 5) {
      toast.error("Please describe your symptoms in more detail");
      return;
    }

    setLoadingSymptoms(true);
    setSymptomsResult(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (res.ok) {
        const data = await res.json();
        setSymptomsResult(data);
        toast.success("Symptoms analyzed successfully!");
      } else {
        toast.error("Failed to run symptoms check");
      }
    } catch (err) {
      toast.error("Network error. Could not reach AI analyzer.");
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReportBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFile) {
      toast.error("Please select a medical report file to scan");
      return;
    }

    setLoadingReport(true);
    setReportResult(null);

    try {
      const res = await fetch("/api/medical-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: reportFile.name,
          fileType: reportFile.type,
          fileSize: reportFile.size,
          fileBase64: reportBase64
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReportResult(data);
        toast.success("Medical report analyzed successfully!");
        fetchReportHistory(); // refresh history
      } else {
        toast.error("Failed to analyze medical report");
      }
    } catch (err) {
      toast.error("Network error. Could not reach AI report analyzer.");
    } finally {
      setLoadingReport(false);
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "high":
        return "border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400";
      case "medium":
        return "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400";
      default:
        return "border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans grid-bg">
      <Navigation />
      <div className="pt-32 pb-24 flex-grow bg-background/60">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold tracking-wider text-accent uppercase mb-3 block">
              Clinical Assistant
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4 flex items-center justify-center gap-2">
              <Stethoscope className="w-8 h-8 text-foreground" />
              AI Clinical Assistant Grid
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Scan symptom profiles or upload medical diagnostic reports to decode abnormalities instantly.
            </p>
          </motion.div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-muted border border-border rounded-lg">
              <button
                onClick={() => setActiveTab("symptoms")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                  activeTab === "symptoms"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Symptom Analysis
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Medical Report Analysis
              </button>
            </div>
          </div>

          {/* Medical Disclaimer Alert */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-amber-500/10 border border-amber-500/20 dark:bg-amber-950/20 dark:border-amber-900/60 rounded-lg text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5 mb-8 leading-relaxed"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 animate-pulse" />
            <p>
              <span className="font-bold">Disclaimer:</span> This AI assistant provides informational guidance only and does not replace professional medical diagnosis, prescription advice, or emergency medical services.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "symptoms" ? (
              <motion.div
                key="symptoms-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Symptom Analyzer Console */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-2xl">
                  <form onSubmit={handleTriageSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                        {t("triage.symptoms")}
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. I have mild chest discomfort and a dry cough since morning, or I have been feeling dizzy and my left arm feels a bit weak..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 outline-none resize-none placeholder-muted-foreground text-foreground text-sm focus:border-border/80 focus:ring-1 focus:ring-ring transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingSymptoms}
                      className="w-full py-3 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {loadingSymptoms ? "Analyzing Symptoms..." : "Run AI Health Assessment"}
                    </button>
                  </form>
                </div>

                {/* Triage Results Console */}
                {symptomsResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-6 shadow-2xl space-y-6"
                  >
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent animate-pulse" />
                      {t("triage.analysis")} Results
                    </h3>

                    {/* Triage Metas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border text-center font-bold flex flex-col items-center justify-center ${getSeverityBadgeClass(symptomsResult.severity)}`}>
                        <div className="text-[10px] uppercase opacity-75 mb-1 tracking-wider">{t("triage.severity")}</div>
                        <div className="text-base font-bold">{symptomsResult.severity}</div>
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-muted text-center flex flex-col items-center justify-center">
                        <div className="text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">Recommended Facility</div>
                        <div className="text-base font-bold text-foreground">{symptomsResult.hospitalType}</div>
                      </div>
                    </div>

                    {/* Suspected Conditions */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Potential Conditions</h4>
                      <div className="space-y-3">
                        {symptomsResult.possibleConditions.length > 0 ? (
                          symptomsResult.possibleConditions.map((cond) => (
                            <div key={cond.name} className="p-4 bg-muted/40 rounded-lg border border-border">
                              <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                                <h5 className="font-bold text-xs text-foreground">{cond.name}</h5>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-card border border-border text-foreground">
                                  Likelihood: {cond.likelihood}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{cond.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No severe specific matches. Follow standard resting protocols.</p>
                        )}
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="p-4 bg-muted border border-border rounded-lg">
                      <h4 className="font-bold text-xs text-foreground mb-1 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-accent" />
                        {t("triage.action")}
                      </h4>
                      <p className="text-xs text-foreground leading-relaxed font-semibold">{symptomsResult.action}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reports-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Medical Report Upload Console */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-2xl">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Upload Diagnostic Report</h2>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="border border-dashed border-border hover:border-border/80 bg-muted/40 rounded-lg p-8 text-center cursor-pointer transition-all relative">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      {reportFile ? (
                        <p className="text-xs font-bold text-accent">{reportFile.name} ({(reportFile.size / 1024).toFixed(0)} KB)</p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Drag & drop or select diagnostic report file</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Supports PDF, PNG, JPG, JPEG (Max 5MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".pdf, image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingReport || !reportFile}
                      className="w-full py-3 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {loadingReport ? "Analyzing Report..." : "Start AI Report Verification"}
                    </button>
                  </form>
                </div>

                {/* Report Analysis Results Console */}
                {reportResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-6 shadow-2xl space-y-6"
                  >
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent animate-pulse" />
                      AI Report Explanation Results
                    </h3>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-wider">Layperson Explanation</h4>
                      <p className="text-xs font-medium leading-relaxed text-foreground">{reportResult.simpleExplanation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Abnormalities */}
                      <div className="p-4 bg-red-500/10 border border-red-500/20 dark:bg-red-950/20 dark:border-red-900/50 rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          Detected Abnormalities
                        </h4>
                        <ul className="text-xs space-y-1.5 text-foreground dark:text-zinc-300 list-disc pl-4 font-medium leading-relaxed">
                          {reportResult.abnormalities?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Specialist recommendation */}
                      <div className="p-4 bg-muted border border-border rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-accent" />
                          Recommended Specialist
                        </h4>
                        <p className="text-sm font-bold text-foreground">{reportResult.recommendedSpecialist}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Consult this specialist for a detailed medical review of these symptoms.</p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="p-4 bg-green-500/10 border border-green-500/20 dark:bg-green-950/20 dark:border-green-900/50 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        Actionable Next Steps
                      </h4>
                      <ul className="text-xs space-y-1.5 text-foreground dark:text-zinc-300 list-decimal pl-4 font-medium leading-relaxed">
                        {reportResult.nextSteps?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Extracted text drawer */}
                    <details className="p-3 border border-border rounded-lg bg-muted/50">
                      <summary className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                        View Raw Extracted Document Text
                      </summary>
                      <pre className="text-[11px] mt-3 bg-card text-muted-foreground p-4 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed border border-border">
                        {reportResult.extractedText}
                      </pre>
                    </details>
                  </motion.div>
                )}

                {/* History list preview */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-2xl">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Recent Diagnostic Scans</h3>
                  <div className="space-y-3">
                    {reportHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">No diagnostic history logged.</p>
                    ) : (
                      reportHistory.map((item) => (
                        <div key={item.id} className="p-4 border border-border rounded-lg bg-muted/40 text-xs flex justify-between items-center gap-4 hover:border-border transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-foreground truncate">{item.fileName}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {new Date(item.timestamp).toLocaleDateString()} • Specialist: <span className="font-semibold text-foreground">{item.analysis?.recommendedSpecialist || "General"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setReportResult({
                              fileName: item.fileName,
                              simpleExplanation: item.analysis?.simpleExplanation,
                              abnormalities: item.analysis?.abnormalities,
                              nextSteps: item.analysis?.nextSteps,
                              recommendedSpecialist: item.analysis?.recommendedSpecialist,
                              extractedText: item.extractedText
                            })}
                            className="px-3 py-1 border border-border bg-card hover:bg-muted text-foreground rounded font-semibold text-[10px] cursor-pointer transition-colors"
                          >
                            View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      <Footer />
    </div>
  );
}
