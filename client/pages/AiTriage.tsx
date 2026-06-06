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

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "high":
        return "border-red-500 bg-red-500/10 text-red-500";
      case "medium":
        return "border-amber-500 bg-amber-500/10 text-amber-500";
      default:
        return "border-green-500 bg-green-500/10 text-green-500";
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 flex items-center justify-center gap-2">
              <Stethoscope className="w-9 h-9 text-primary animate-pulse" />
              AI Clinical Assistant Grid
            </h1>
            <p className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto">
              Scan symptom profiles or upload medical diagnostic reports to decode abnormalities instantly.
            </p>
          </motion.div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-black/5 dark:bg-white/5 border border-border/80 rounded-xl">
              <button
                onClick={() => setActiveTab("symptoms")}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "symptoms"
                    ? "bg-primary text-white shadow"
                    : "text-foreground/75 hover:text-primary"
                }`}
              >
                Symptom Analysis
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "reports"
                    ? "bg-primary text-white shadow"
                    : "text-foreground/75 hover:text-primary"
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
            className="p-4 bg-amber-500/15 border border-amber-500/25 rounded-2xl text-amber-600 dark:text-amber-500 text-xs flex items-start gap-2.5 mb-8"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">Disclaimer:</span> This AI assistant provides informational guidance only and does not replace professional medical diagnosis, prescription advice, or emergency medical services.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "symptoms" ? (
              <motion.div
                key="symptoms-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Symptom Analyzer Console */}
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <form onSubmit={handleTriageSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground/80">
                        {t("triage.symptoms")}
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. I have mild chest discomfort and a dry cough since morning, or I have been feeling dizzy and my left arm feels a bit weak..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-3 outline-none resize-none placeholder-foreground/30 text-base"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingSymptoms}
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {loadingSymptoms ? "Analyzing Symptoms..." : "Run AI Health Assessment"}
                    </button>
                  </form>
                </div>

                {/* Triage Results Console */}
                {symptomsResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-bold mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      {t("triage.analysis")} Results
                    </h3>

                    {/* Triage Metas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className={`p-4 rounded-xl border text-center font-bold ${getSeverityColor(symptomsResult.severity)}`}>
                        <div className="text-xs uppercase opacity-75 mb-1">{t("triage.severity")}</div>
                        <div className="text-lg">{symptomsResult.severity}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5 text-center">
                        <div className="text-xs uppercase text-foreground/50 mb-1">Recommended Facility</div>
                        <div className="text-lg font-bold text-foreground">{symptomsResult.hospitalType}</div>
                      </div>
                    </div>

                    {/* Suspected Conditions */}
                    <div className="space-y-4 mb-6">
                      <h4 className="font-bold text-sm text-foreground/70 uppercase">Potential Conditions</h4>
                      {symptomsResult.possibleConditions.length > 0 ? (
                        symptomsResult.possibleConditions.map((cond) => (
                          <div key={cond.name} className="p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-border/30">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-bold text-foreground">{cond.name}</h5>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                                Likelihood: {cond.likelihood}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/60 leading-relaxed">{cond.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-foreground/50">No severe specific matches. Follow standard resting protocols.</p>
                      )}
                    </div>

                    {/* Recommended Action */}
                    <div className="p-4 bg-primary/15 border border-primary/25 rounded-xl">
                      <h4 className="font-bold text-sm text-primary mb-1 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {t("triage.action")}
                      </h4>
                      <p className="text-sm font-semibold text-foreground">{symptomsResult.action}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reports-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Medical Report Upload Console */}
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <h2 className="text-lg font-bold mb-4">Upload Diagnostic Report</h2>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all relative">
                      <Upload className="w-8 h-8 text-foreground/40 mx-auto mb-2" />
                      {reportFile ? (
                        <p className="text-xs font-bold text-primary">{reportFile.name} ({(reportFile.size / 1024).toFixed(0)} KB)</p>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-foreground/60">Drag & drop or select diagnostic report file</p>
                          <p className="text-[10px] text-foreground/45 mt-1">Supports PDF, PNG, JPG, JPEG (Max 5MB)</p>
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
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {loadingReport ? "Analyzing Report..." : "Start AI Report Verification"}
                    </button>
                  </form>
                </div>

                {/* Report Analysis Results Console */}
                {reportResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 border border-white/20 space-y-6"
                  >
                    <h3 className="text-xl font-bold border-b border-border/50 pb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      AI Report Explanation Results
                    </h3>

                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground/50 mb-1.5">Layperson Explanation</h4>
                      <p className="text-sm font-semibold leading-relaxed text-foreground/80">{reportResult.simpleExplanation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Abnormalities */}
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Detected Abnormalities
                        </h4>
                        <ul className="text-xs space-y-1.5 text-foreground/85 list-disc pl-4 font-semibold">
                          {reportResult.abnormalities?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Specialist recommendation */}
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          Recommended Specialist
                        </h4>
                        <p className="text-sm font-black text-foreground">{reportResult.recommendedSpecialist}</p>
                        <p className="text-[10px] text-foreground/50">Consult this specialist for a detailed medical review of these symptoms.</p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Actionable Next Steps
                      </h4>
                      <ul className="text-xs space-y-1.5 text-foreground/85 list-decimal pl-4 font-semibold">
                        {reportResult.nextSteps?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Extracted text drawer */}
                    <details className="p-3 border border-border/40 rounded-xl bg-white/20 dark:bg-slate-800/20">
                      <summary className="text-xs font-bold text-foreground/60 cursor-pointer select-none">
                        View Raw Extracted Document Text
                      </summary>
                      <pre className="text-[10px] mt-2 bg-slate-950 text-slate-300 p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap">
                        {reportResult.extractedText}
                      </pre>
                    </details>
                  </motion.div>
                )}

                {/* History list preview */}
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <h3 className="text-sm font-bold mb-4">Recent Diagnostic Scans</h3>
                  <div className="space-y-3">
                    {reportHistory.length === 0 ? (
                      <p className="text-xs text-foreground/50 text-center py-4">No diagnostic history logged.</p>
                    ) : (
                      reportHistory.map((item) => (
                        <div key={item.id} className="p-3 border border-border/40 rounded-xl bg-white/20 dark:bg-slate-800/20 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-foreground truncate max-w-[250px]">{item.fileName}</div>
                            <div className="text-[10px] text-foreground/50 mt-0.5">
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
                            className="px-2.5 py-1 border border-border bg-white dark:bg-slate-900 rounded font-bold text-[10px] hover:bg-black/5"
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
