import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Camera, Upload, ShieldAlert, Award, FileText, 
  Activity, Info, RefreshCw, Send, CheckCircle, Eye, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface InjuryResult {
  analysisId: string;
  injuryType: string;
  severity: string;
  confidence: number;
  emergencyLevel: string;
  recommendations: string[];
  timestamp: string;
}

interface HistoryItem {
  id: string;
  imageUrl: string | null;
  injuryType: string;
  severity: string;
  confidence: number;
  recommendations: string[];
  emergencyLevel: string;
  timestamp: string;
}

export default function InjuryDetection() {
  const { t } = useLanguage();

  const [image, setImage] = useState<string | null>(null);
  const [suspectedType, setSuspectedType] = useState<string>("burns");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<InjuryResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/injury/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load injury history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds limit (5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please select or capture an image to analyze");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/injury/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspectedType,
          imageBase64: image
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("Injury scanned successfully!");
        fetchHistory(); // refresh history logs
      } else {
        toast.error("Failed to analyze injury. Check file contents.");
      }
    } catch (err) {
      toast.error("Network error connecting to Vision model adapter.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "high": return "border-red-500 bg-red-500/10 text-red-500";
      case "medium": return "border-amber-500 bg-amber-500/10 text-amber-500";
      default: return "border-green-500 bg-green-500/10 text-green-500";
    }
  };

  const cleanAnalyzeReset = () => {
    setImage(null);
    setResult(null);
  };

  // Mock charts representation metrics
  const radarData = result ? [
    { subject: 'Visual Match', A: result.confidence, fullMark: 100 },
    { subject: 'Tissue Depth', A: result.severity.toLowerCase().includes("high") ? 90 : result.severity.toLowerCase().includes("medium") ? 60 : 30, fullMark: 100 },
    { subject: 'Vascular Impact', A: result.severity.toLowerCase().includes("high") ? 85 : 40, fullMark: 100 },
    { subject: 'Surface Spread', A: 75, fullMark: 100 },
    { subject: 'Infection Index', A: 20, fullMark: 100 }
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
            <div className="inline-flex items-center space-x-2.5 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-3">
              <Camera className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                AI Vision Injury Analysis
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
              AI Injury Detector
            </h1>
            <p className="text-sm sm:text-base text-foreground/60 max-w-xl mx-auto mt-2">
              Scan wound photos to detect burns, cuts, fractures, skin infections, bruises, and swelling.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Console: Image upload + Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="upload-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="glass rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-xl"
                  >
                    <form onSubmit={handleDetect} className="space-y-6">
                      
                      {/* Image Dropzone panel */}
                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase text-foreground/60 mb-2">Capture or Upload Wound Image</span>
                        <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 flex flex-col items-center justify-center bg-white/20 dark:bg-slate-900/20 hover:bg-black/5 hover:border-primary/50 transition-all cursor-pointer relative min-h-[200px]">
                          {image ? (
                            <div className="w-full flex flex-col items-center gap-3">
                              <img 
                                src={image} 
                                alt="Injury Preview" 
                                className="max-h-[200px] rounded-lg shadow border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="text-xs text-red-500 font-bold hover:underline"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="text-center space-y-2">
                              <Upload className="w-10 h-10 text-foreground/30 mx-auto" />
                              <div className="text-xs font-bold text-foreground/60">
                                Drag & drop or click to upload photo
                              </div>
                              <div className="text-[10px] text-foreground/45">
                                Supports PNG, JPG, JPEG (Max 5MB)
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* suspected selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-foreground/60 mb-2">Suspected Wound Type</label>
                          <select 
                            value={suspectedType} 
                            onChange={(e) => setSuspectedType(e.target.value)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border border-border/80 rounded-xl px-4 py-2.5 outline-none text-sm font-semibold"
                          >
                            <option value="burns">Thermal Burn</option>
                            <option value="cuts">Cut / Laceration</option>
                            <option value="fractures">Fracture / Broken Bone</option>
                            <option value="infections">Skin Infection</option>
                            <option value="bruises">Bruise / Contusion</option>
                            <option value="swelling">Swelling / Sprain</option>
                          </select>
                        </div>

                        <div className="text-xs text-foreground/60 font-semibold flex items-center bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-border/40">
                          <Info className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          Identifying suspected areas optimizes image classification diagnostics.
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !image}
                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing Injury Patterns...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Perform AI Injury Classification
                          </>
                        )}
                      </button>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    {/* Score summary panel */}
                    <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl relative overflow-hidden bg-gradient-to-r from-red-500/5 to-amber-500/5">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Scan Diagnosis</span>
                          <h2 className="text-2xl font-black mt-1">
                            {result.injuryType}
                          </h2>
                          <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(result.severity)}`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Severity: {result.severity}
                          </div>
                        </div>

                        <div className="text-left sm:text-right font-semibold">
                          <div className="text-2xl font-black text-red-500">{result.confidence}%</div>
                          <div className="text-[10px] text-foreground/50 uppercase">Analysis Confidence</div>
                          <div className="text-xs text-red-600 dark:text-red-400 font-extrabold bg-red-500/10 px-2 py-0.5 rounded mt-1.5 inline-block">
                            {result.emergencyLevel}
                          </div>
                        </div>
                      </div>

                      {/* Radar Chart Visual */}
                      <div className="h-[230px] w-full mt-6 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="Injury Index" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recommendations check-list */}
                    <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
                      <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-red-500" />
                        First-Aid Procedures (Step-by-Step)
                      </h3>
                      <ul className="text-xs space-y-2.5 font-semibold text-foreground/85">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed mt-0.5">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cleanAnalyzeReset}
                        className="px-6 py-2.5 border border-border bg-white dark:bg-slate-900 rounded-xl font-bold text-xs hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Analyze Another Photo
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Column: Disclaimer + History lists */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Emergency Alert Guidance */}
              <div className="glass rounded-3xl p-6 border border-white/20 text-xs font-semibold leading-relaxed space-y-4 bg-red-500/5">
                <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Clinical Emergency Directives
                </h3>
                <p>
                  If the injury exhibits any of the following symptoms, bypass self-first-aid and proceed directly to the nearest hospital:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/75">
                  <li>Uncontrolled bleeding that does not stop after 10 minutes of direct pressure.</li>
                  <li>Bone visibility through cuts, or obvious structural limb deformation.</li>
                  <li>Severe burns covering areas larger than the patient's palm, or face/joint regions.</li>
                  <li>Unconsciousness, severe dizziness, cold sweat, or rapid heartbeat.</li>
                </ul>
              </div>

              {/* History list preview */}
              <div className="glass rounded-3xl p-6 border border-white/20">
                <h3 className="text-sm font-bold mb-4 flex justify-between items-center">
                  <span>Recent Scan History</span>
                </h3>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-foreground/50 text-center py-6">No previous scans found.</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="p-3 border border-border/40 rounded-xl bg-white/20 dark:bg-slate-800/20 text-xs font-semibold flex justify-between items-center">
                        <div>
                          <div className="font-bold text-foreground">{item.injuryType}</div>
                          <div className="text-[10px] text-foreground/50 mt-0.5 flex items-center gap-1">
                            <span>Severity: <span className="font-bold text-foreground">{item.severity}</span></span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-red-500 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                            {item.confidence}% Match
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
