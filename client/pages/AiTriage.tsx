import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, AlertTriangle, Activity, Stethoscope, Info } from "lucide-react";
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

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms || symptoms.length < 5) {
      toast.error("Please describe your symptoms in more detail");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("Symptoms analyzed successfully!");
      } else {
        toast.error("Failed to run symptoms check");
      }
    } catch (err) {
      toast.error("Network error. Could not reach AI analyzer.");
    } finally {
      setLoading(false);
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
              {t("triage.title")}
            </h1>
            <p className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto">
              Analyze your current symptoms instantly with clinical logic mapping rules to receive severity alerts.
            </p>
          </motion.div>

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

          {/* Symptom Analyzer Console */}
          <div className="grid grid-cols-1 gap-6">
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/20"
            >
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
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Analyzing Symptoms..." : "Run AI Health Assessment"}
                </button>
              </form>
            </motion.div>

            {/* Results Console */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="glass rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      {t("triage.analysis")} Results
                    </h3>

                    {/* Triage Metas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className={`p-4 rounded-xl border text-center font-bold ${getSeverityColor(result.severity)}`}>
                        <div className="text-xs uppercase opacity-75 mb-1">{t("triage.severity")}</div>
                        <div className="text-lg">{result.severity}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5 text-center">
                        <div className="text-xs uppercase text-foreground/50 mb-1">Recommended Facility</div>
                        <div className="text-lg font-bold text-foreground">{result.hospitalType}</div>
                      </div>
                    </div>

                    {/* Suspected Conditions */}
                    <div className="space-y-4 mb-6">
                      <h4 className="font-bold text-sm text-foreground/70 uppercase">Potential Conditions</h4>
                      {result.possibleConditions.length > 0 ? (
                        result.possibleConditions.map((cond) => (
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
                      <p className="text-sm font-semibold text-foreground">{result.action}</p>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
