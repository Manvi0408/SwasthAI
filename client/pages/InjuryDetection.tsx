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

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "high": return "border-red-900/60 bg-red-950/30 text-red-400";
      case "medium": return "border-amber-900/60 bg-amber-950/30 text-amber-400";
      default: return "border-green-900/60 bg-green-950/30 text-green-400";
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
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase mb-3 block">
              AI Vision Assistant
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              AI Injury Detector
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Scan wound photos to detect burns, cuts, fractures, skin infections, bruises, and swelling.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Console: Image upload + Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="upload-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl"
                  >
                    <form onSubmit={handleDetect} className="space-y-6">
                      
                      {/* Image Dropzone panel */}
                      <div className="space-y-2">
                        <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Capture or Upload Wound Image</span>
                        <div className="border border-dashed border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all cursor-pointer relative min-h-[220px]">
                          {image ? (
                            <div className="w-full flex flex-col items-center gap-4 py-2">
                              <img 
                                src={image} 
                                alt="Injury Preview" 
                                className="max-h-[180px] rounded border border-zinc-850 shadow-sm object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="text-xs text-red-400 font-semibold hover:underline"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="text-center space-y-2 py-4">
                              <Upload className="w-8 h-8 text-zinc-500 mx-auto" />
                              <div className="text-xs font-semibold text-zinc-400">
                                Drag & drop or click to upload photo
                              </div>
                              <div className="text-[10px] text-zinc-500">
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
                          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Suspected Wound Type</label>
                          <select 
                            value={suspectedType} 
                            onChange={(e) => setSuspectedType(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none text-xs font-semibold text-white transition-all focus:border-zinc-700"
                          >
                            <option value="burns">Thermal Burn</option>
                            <option value="cuts">Cut / Laceration</option>
                            <option value="fractures">Fracture / Broken Bone</option>
                            <option value="infections">Skin Infection</option>
                            <option value="bruises">Bruise / Contusion</option>
                            <option value="swelling">Swelling / Sprain</option>
                          </select>
                        </div>

                        <div className="text-xs text-zinc-400 font-medium flex items-start bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
                          <Info className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                          Identifying suspected areas optimizes image classification diagnostics.
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !image}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Analyzing Injury Patterns...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Perform AI Injury Classification
                          </>
                        )}
                      </button>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Score summary panel */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-900">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Scan Diagnosis</span>
                          <h2 className="text-xl font-extrabold text-white mt-1">
                            {result.injuryType}
                          </h2>
                          <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-semibold ${getSeverityBadgeClass(result.severity)}`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Severity: {result.severity}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-2xl font-black text-red-500">{result.confidence}%</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Analysis Confidence</div>
                          <div className="text-xs text-red-400 font-bold bg-red-950/30 border border-red-905 px-2 py-0.5 rounded mt-2 inline-block">
                            {result.emergencyLevel}
                          </div>
                        </div>
                      </div>

                      {/* Radar Chart Visual */}
                      <div className="h-[240px] w-full mt-6 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#71717a' }} />
                            <Radar name="Injury Index" dataKey="A" stroke="#dc2626" fill="#ef4444" fillOpacity={0.2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recommendations check-list */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-red-550" />
                        First-Aid Procedures (Step-by-Step)
                      </h3>
                      <ul className="text-xs space-y-3 font-medium text-zinc-300 leading-relaxed">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
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
                        className="px-4 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 rounded-lg font-semibold text-xs text-zinc-305 flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
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
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl text-xs leading-relaxed space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-550" />
                  Clinical Emergency Directives
                </h3>
                <p className="text-zinc-400">
                  If the injury exhibits any of the following symptoms, bypass self-first-aid and proceed directly to the nearest hospital:
                </p>
                <ul className="list-disc pl-4 space-y-2 text-zinc-500 font-medium">
                  <li>Uncontrolled bleeding that does not stop after 10 minutes of direct pressure.</li>
                  <li>Bone visibility through cuts, or obvious structural limb deformation.</li>
                  <li>Severe burns covering areas larger than the patient's palm, or face/joint regions.</li>
                  <li>Unconsciousness, severe dizziness, cold sweat, or rapid heartbeat.</li>
                </ul>
              </div>

              {/* History list preview */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Recent Scan History</h3>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">No previous scans found.</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="p-4 border border-zinc-900 rounded-lg bg-zinc-900/40 text-xs flex justify-between items-center gap-4 hover:border-zinc-800 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white truncate">{item.injuryType}</div>
                          <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span>Severity: <span className="font-bold text-zinc-405">{item.severity}</span></span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/30 border border-red-900/60">
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
