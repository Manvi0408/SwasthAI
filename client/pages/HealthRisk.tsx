import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Heart, Activity, ShieldAlert, Award, FileText, 
  ChevronRight, Brain, RefreshCw, Send, CheckCircle, Flame, User
} from "lucide-react";
import { toast } from "sonner";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Cell, RadialBarChart, RadialBar, Legend 
} from "recharts";

interface AssessmentResult {
  assessmentId: string;
  bmi: number;
  diabetesRisk: number;
  heartDiseaseRisk: number;
  strokeRisk: number;
  riskScore: number;
  riskCategory: string;
  recommendations: string[];
  lifestyleSuggestions: string[];
  timestamp: string;
}

interface HistoryItem {
  id: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: string;
  diabetes: boolean;
  smoking: boolean;
  alcohol: boolean;
  familyHistory: string;
  activityLevel: string;
  heartDiseaseRisk: number;
  strokeRisk: number;
  diabetesRisk: number;
  riskScore: number;
  riskCategory: string;
  recommendations: string[];
  lifestyleSuggestions: string[];
  timestamp: string;
}

export default function HealthRisk() {
  const { t } = useLanguage();

  // Form states
  const [age, setAge] = useState<number>(35);
  const [height, setHeight] = useState<number>(172);
  const [weight, setWeight] = useState<number>(70);
  const [bloodPressure, setBloodPressure] = useState<string>("120/80");
  const [diabetes, setDiabetes] = useState<boolean>(false);
  const [smoking, setSmoking] = useState<boolean>(false);
  const [alcohol, setAlcohol] = useState<boolean>(false);
  const [familyHistory, setFamilyHistory] = useState<string>("None");
  const [activityLevel, setActivityLevel] = useState<string>("Moderate");

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/health-risk/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load assessment history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/health-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          height,
          weight,
          bloodPressure,
          diabetes,
          smoking,
          alcohol,
          familyHistory,
          activityLevel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("Health risk assessment complete!");
        fetchHistory(); // refresh history
      } else {
        toast.error("Assessment request failed. Check input parameters.");
      }
    } catch (err) {
      toast.error("Network error connecting to assessment engine.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 55) return "text-red-500";
    if (score > 25) return "text-amber-500";
    return "text-green-500";
  };

  const getRiskBg = (category: string) => {
    switch (category.toLowerCase()) {
      case "high": return "bg-red-500/10 border-red-500/20 text-red-500";
      case "medium": return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default: return "bg-green-500/10 border-green-500/20 text-green-500";
    }
  };

  // Prepare chart data
  const barChartData = result ? [
    { name: "Heart Risk", score: result.heartDiseaseRisk, fill: "#F87171" },
    { name: "Stroke Risk", score: result.strokeRisk, fill: "#FBBF24" },
    { name: "Diabetes Risk", score: result.diabetesRisk, fill: "#34D399" }
  ] : [];

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />

      <div className="pt-24 pb-16 flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center space-x-2.5 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Predictive Wellness Engine
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Health Risk Assessment Center
            </h1>
            <p className="text-sm sm:text-base text-foreground/60 max-w-xl mx-auto mt-2">
              Assess your likelihood of chronic conditions using advanced medical risk calculators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form or Results */}
            <div className="lg:col-span-7 space-y-6">
              
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="assessment-form"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="glass rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-xl"
                  >
                    <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Patient Demographics & Vitals
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Age (years)</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={120} 
                            value={age} 
                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Height (cm)</label>
                          <input 
                            type="number" 
                            min={50} 
                            max={250} 
                            value={height} 
                            onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Weight (kg)</label>
                          <input 
                            type="number" 
                            min={10} 
                            max={300} 
                            value={weight} 
                            onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Blood Pressure (Systolic/Diastolic)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 120/80" 
                            value={bloodPressure} 
                            onChange={(e) => setBloodPressure(e.target.value)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Activity Level</label>
                          <select 
                            value={activityLevel} 
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                          >
                            <option value="Sedentary">Sedentary (No Exercise)</option>
                            <option value="Light">Lightly Active (1-2 days/week)</option>
                            <option value="Moderate">Moderately Active (3-5 days/week)</option>
                            <option value="Active">Very Active (Daily Heavy)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Family History (Select primary indicator)</label>
                        <select 
                          value={familyHistory} 
                          onChange={(e) => setFamilyHistory(e.target.value)}
                          className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm"
                        >
                          <option value="None">No family history of cardiovascular/endocrine disease</option>
                          <option value="Diabetes">Family history of Type 1/2 Diabetes</option>
                          <option value="Heart Disease">Family history of Coronary Heart Disease</option>
                          <option value="Stroke">Family history of Stroke/Hypertension</option>
                          <option value="Multiple">Multiple family history profiles</option>
                        </select>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider block">Lifestyle Risks Check</span>
                        <div className="flex flex-wrap gap-6 text-xs font-semibold">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={diabetes} 
                              onChange={(e) => setDiabetes(e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                            />
                            I have diagnosed Diabetes
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={smoking} 
                              onChange={(e) => setSmoking(e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                            />
                            I smoke tobacco products
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={alcohol} 
                              onChange={(e) => setAlcohol(e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                            />
                            I drink alcohol frequently
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Calculating Risk Indexes...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Compute Cardiovascular & Metabolic Risk
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="assessment-results"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    {/* Score summary panel */}
                    <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl relative overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">Cumulative Risk Index</span>
                          <h2 className="text-3xl font-black mt-1">
                            {result.riskScore}%
                          </h2>
                          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRiskBg(result.riskCategory)}`}>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {result.riskCategory} Risk Profile
                          </div>
                        </div>

                        <div className="text-right text-xs text-foreground/50">
                          <div>BMI calculated: <span className="font-bold text-foreground">{result.bmi}</span></div>
                          <div className="mt-0.5">Blood Pressure: <span className="font-bold text-foreground">{bloodPressure}</span></div>
                        </div>
                      </div>

                      {/* Charts display */}
                      <div className="h-[200px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Risk Probability']} />
                            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                              {barChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recommendations grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Clinical Recommendations */}
                      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
                        <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Recommended Medical Steps
                        </h3>
                        <ul className="text-xs space-y-2.5 font-semibold text-foreground/85">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Lifestyle recommendations */}
                      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
                        <h3 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          Lifestyle Adjustments
                        </h3>
                        <ul className="text-xs space-y-2.5 font-semibold text-foreground/85">
                          {result.lifestyleSuggestions.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setResult(null)}
                        className="px-6 py-2.5 border border-border bg-white dark:bg-slate-900 rounded-xl font-bold text-xs hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Run New Assessment
                      </button>
                      <button
                        onClick={() => setShowHistory(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Assessment Records
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Column: Information panel + History logs summary */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Information / Instruction Board */}
              <div className="glass rounded-3xl p-6 border border-white/20 text-xs font-semibold leading-relaxed space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  Assessment Index Guidelines
                </h3>
                <p>
                  Calculations utilize multi-variable epidemiological algorithms mapped in accordance with clinical criteria:
                </p>
                <div className="space-y-3 border-l-2 border-primary/20 pl-3">
                  <div>
                    <span className="font-bold text-foreground block">Diabetes Risk:</span>
                    Evaluated by matching Age weight metrics (BMI), daily movement, and familial genetics.
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Heart Disease Risk:</span>
                    Driven by arterial tension (systolic/diastolic blood pressure), active tobacco smoking status, and blood sugar histories.
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Stroke Risk:</span>
                    Correlated with acute hypertension markers, high alcohol volumes, and aged clinical indicators.
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-[10px] text-amber-600 dark:text-amber-500 leading-normal border border-amber-500/15">
                  Disclaimer: This tool calculates demographic risk scales based on basic wellness criteria and does not constitute formal medical diagnoses.
                </div>
              </div>

              {/* History list preview */}
              <div className="glass rounded-3xl p-6 border border-white/20">
                <h3 className="text-sm font-bold mb-4 flex justify-between items-center">
                  <span>Recent Assessment Records</span>
                  <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    {showHistory ? "Close logs" : "See all logs"}
                  </button>
                </h3>

                <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-foreground/50 text-center py-6">No assessments completed yet.</p>
                  ) : (
                    history.slice(0, 4).map((item) => (
                      <div key={item.id} className="p-3 border border-border/40 rounded-xl bg-white/20 dark:bg-slate-800/20 text-xs font-semibold flex justify-between items-center">
                        <div>
                          <div>Age: {item.age} • BMI: {item.bmi}</div>
                          <div className="text-[10px] text-foreground/50 mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBg(item.riskCategory)}`}>
                            {item.riskScore}% {item.riskCategory}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Full Screen History Overlay Modal */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-white dark:bg-slate-950 border border-border rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl"
                >
                  <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-1.5">
                      <FileText className="w-5.5 h-5.5 text-primary" />
                      Comprehensive Wellness Risk Logs
                    </h2>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-xs font-bold hover:bg-black/10 text-foreground/75"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto text-xs">
                    {history.length === 0 ? (
                      <p className="text-center text-foreground/50 py-12">No records found.</p>
                    ) : (
                      <table className="w-full text-left border-collapse font-semibold">
                        <thead>
                          <tr className="border-b border-border text-[10px] uppercase text-foreground/50">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Metrics</th>
                            <th className="py-2.5">Diabetes Risk</th>
                            <th className="py-2.5">Heart Risk</th>
                            <th className="py-2.5">Stroke Risk</th>
                            <th className="py-2.5">Total Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {history.map((h) => (
                            <tr key={h.id} className="hover:bg-primary/5 transition-colors">
                              <td className="py-3">
                                {new Date(h.timestamp).toLocaleDateString()}
                                <div className="text-[10px] text-foreground/45 mt-0.5">{new Date(h.timestamp).toLocaleTimeString()}</div>
                              </td>
                              <td className="py-3">
                                <div>Age: {h.age} • BP: {h.bloodPressure}</div>
                                <div className="text-[10px] text-foreground/50 mt-0.5">BMI: {h.bmi} • Smoker: {h.smoking ? "Yes" : "No"}</div>
                              </td>
                              <td className="py-3 font-bold text-emerald-500">{h.diabetesRisk}%</td>
                              <td className="py-3 font-bold text-red-400">{h.heartDiseaseRisk}%</td>
                              <td className="py-3 font-bold text-amber-500">{h.strokeRisk}%</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBg(h.riskCategory)}`}>
                                  {h.riskScore}% {h.riskCategory}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <Footer />
    </div>
  );
}
