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
  Tooltip, Cell 
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

  const getRiskBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "high": return "border-red-900/60 bg-red-950/30 text-red-400";
      case "medium": return "border-amber-900/60 bg-amber-950/30 text-amber-400";
      default: return "border-green-900/60 bg-green-950/30 text-green-400";
    }
  };

  // Prepare chart data
  const barChartData = result ? [
    { name: "Heart Risk", score: result.heartDiseaseRisk, fill: "#ef4444" },
    { name: "Stroke Risk", score: result.strokeRisk, fill: "#f59e0b" },
    { name: "Diabetes Risk", score: result.diabetesRisk, fill: "#10b981" }
  ] : [];

  return (
    <div className="w-full min-h-screen bg-black text-zinc-100 flex flex-col font-sans grid-bg">
      <Navigation />

      <div className="pt-32 pb-24 flex-grow bg-black/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold tracking-wider text-accent uppercase mb-3 block">
              Predictive Diagnostics
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              Health Risk Assessment
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Assess your likelihood of chronic conditions using advanced medical risk calculators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form or Results */}
            <div className="lg:col-span-7 space-y-6">
              
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="assessment-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl"
                  >
                    <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2 border-b border-zinc-900 pb-3">
                      <User className="w-4 h-4 text-accent" />
                      Patient Demographics & Vitals
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-550 uppercase tracking-wider mb-2">Age (years)</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={120} 
                            value={age} 
                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-555 uppercase tracking-wider mb-2">Height (cm)</label>
                          <input 
                            type="number" 
                            min={50} 
                            max={250} 
                            value={height} 
                            onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-555 uppercase tracking-wider mb-2">Weight (kg)</label>
                          <input 
                            type="number" 
                            min={10} 
                            max={300} 
                            value={weight} 
                            onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-555 uppercase tracking-wider mb-2">Blood Pressure (Systolic/Diastolic)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 120/80" 
                            value={bloodPressure} 
                            onChange={(e) => setBloodPressure(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-555 uppercase tracking-wider mb-2">Activity Level</label>
                          <select 
                            value={activityLevel} 
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                          >
                            <option value="Sedentary">Sedentary (No Exercise)</option>
                            <option value="Light">Lightly Active (1-2 days/week)</option>
                            <option value="Moderate">Moderately Active (3-5 days/week)</option>
                            <option value="Active">Very Active (Daily Heavy)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-555 uppercase tracking-wider mb-2">Family History (Select primary indicator)</label>
                        <select 
                          value={familyHistory} 
                          onChange={(e) => setFamilyHistory(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white focus:border-zinc-700 focus:ring-zinc-700"
                        >
                          <option value="None">No family history of cardiovascular/endocrine disease</option>
                          <option value="Diabetes">Family history of Type 1/2 Diabetes</option>
                          <option value="Heart Disease">Family history of Coronary Heart Disease</option>
                          <option value="Stroke">Family history of Stroke/Hypertension</option>
                          <option value="Multiple">Multiple family history profiles</option>
                        </select>
                      </div>

                      <div className="p-5 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-3.5">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">Lifestyle Risks Check</span>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-xs font-semibold text-zinc-400">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={diabetes} 
                              onChange={(e) => setDiabetes(e.target.checked)}
                              className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 w-4 h-4"
                            />
                            I have diagnosed Diabetes
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={smoking} 
                              onChange={(e) => setSmoking(e.target.checked)}
                              className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 w-4 h-4"
                            />
                            I smoke tobacco products
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={alcohol} 
                              onChange={(e) => setAlcohol(e.target.checked)}
                              className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 w-4 h-4"
                            />
                            I drink alcohol frequently
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Calculating Risk Indexes...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Compute Cardiovascular & Metabolic Risk
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="assessment-results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Score summary panel */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-900">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cumulative Risk Index</span>
                          <h2 className="text-3xl font-black text-white mt-1">
                            {result.riskScore}%
                          </h2>
                          <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-semibold ${getRiskBadgeClass(result.riskCategory)}`}>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {result.riskCategory} Risk Profile
                          </div>
                        </div>

                        <div className="text-left sm:text-right text-xs text-zinc-400 font-medium">
                          <div>BMI calculated: <span className="font-bold text-white">{result.bmi}</span></div>
                          <div className="mt-1">Blood Pressure: <span className="font-bold text-white">{bloodPressure}</span></div>
                        </div>
                      </div>

                      {/* Charts display */}
                      <div className="h-[210px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold' }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} />
                            <Tooltip 
                              contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#ffffff' }}
                              formatter={(value) => [`${value}%`, 'Risk Probability']} 
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              {barChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recommendations grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Clinical Recommendations */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 shadow-2xl space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          Recommended Medical Steps
                        </h3>
                        <ul className="text-xs space-y-2.5 font-medium text-zinc-300 leading-relaxed">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Lifestyle recommendations */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 shadow-2xl space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          Lifestyle Adjustments
                        </h3>
                        <ul className="text-xs space-y-2.5 font-medium text-zinc-300 leading-relaxed">
                          {result.lifestyleSuggestions.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setResult(null)}
                        className="px-4 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 rounded-lg font-semibold text-xs text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Run New Assessment
                      </button>
                      <button
                        onClick={() => setShowHistory(true)}
                        className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
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
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl text-xs leading-relaxed space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent" />
                  Assessment Index Guidelines
                </h3>
                <p className="text-zinc-400">
                  Calculations utilize multi-variable epidemiological algorithms mapped in accordance with clinical criteria:
                </p>
                <div className="space-y-3.5 border-l border-zinc-800 pl-3.5">
                  <div>
                    <span className="font-semibold text-zinc-200 block mb-0.5">Diabetes Risk:</span>
                    <span className="text-zinc-400">Evaluated by matching Age weight metrics (BMI), daily movement, and familial genetics.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200 block mb-0.5">Heart Disease Risk:</span>
                    <span className="text-zinc-400">Driven by arterial tension (systolic/diastolic blood pressure), active tobacco smoking status, and blood sugar histories.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200 block mb-0.5">Stroke Risk:</span>
                    <span className="text-zinc-400">Correlated with acute hypertension markers, high alcohol volumes, and aged clinical indicators.</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-955/20 border border-amber-900/60 rounded-md text-[11px] text-amber-400 leading-relaxed">
                  Disclaimer: This tool calculates demographic risk scales based on basic wellness criteria and does not constitute formal medical diagnoses.
                </div>
              </div>

              {/* History list preview */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 flex justify-between items-center">
                  <span>Recent Assessment Records</span>
                  <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="text-xs text-accent font-bold hover:underline cursor-pointer"
                  >
                    {showHistory ? "Close logs" : "See all logs"}
                  </button>
                </h3>

                <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-zinc-550 text-center py-6">No assessments completed yet.</p>
                  ) : (
                    history.slice(0, 4).map((item) => (
                      <div key={item.id} className="p-4 border border-zinc-900 rounded-lg bg-zinc-900/40 text-xs flex justify-between items-center gap-4 hover:border-zinc-800 transition-colors">
                        <div>
                          <div className="font-bold text-white">Age: {item.age} • BMI: {item.bmi}</div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskBadgeClass(item.riskCategory)}`}>
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
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 sm:p-6"
              >
                <motion.div
                  initial={{ scale: 0.98, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.98, y: 8 }}
                  className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-accent animate-pulse" />
                      Comprehensive Wellness Risk Logs
                    </h2>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="px-3 py-1.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 rounded text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto text-xs">
                    {history.length === 0 ? (
                      <p className="text-center text-zinc-550 py-12">No records found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 text-[10px] uppercase text-zinc-500 font-bold">
                              <th className="py-3 px-2">Date</th>
                              <th className="py-3 px-2">Metrics</th>
                              <th className="py-3 px-2">Diabetes Risk</th>
                              <th className="py-3 px-2">Heart Risk</th>
                              <th className="py-3 px-2">Stroke Risk</th>
                              <th className="py-3 px-2">Total Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-350 font-medium">
                            {history.map((h) => (
                              <tr key={h.id} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="py-3 px-2">
                                  <div>{new Date(h.timestamp).toLocaleDateString()}</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">{new Date(h.timestamp).toLocaleTimeString()}</div>
                                </td>
                                <td className="py-3 px-2">
                                  <div>Age: {h.age} • BP: {h.bloodPressure}</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">BMI: {h.bmi} • Smoker: {h.smoking ? "Yes" : "No"}</div>
                                </td>
                                <td className="py-3 px-2 font-bold text-emerald-400">{h.diabetesRisk}%</td>
                                <td className="py-3 px-2 font-bold text-red-400">{h.heartDiseaseRisk}%</td>
                                <td className="py-3 px-2 font-bold text-amber-400">{h.strokeRisk}%</td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskBadgeClass(h.riskCategory)}`}>
                                    {h.riskScore}% {h.riskCategory}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
