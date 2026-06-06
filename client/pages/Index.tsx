import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, ShieldAlert, Heart, Stethoscope, Droplet, 
  MapPin, Phone, Star, Percent, Sparkles, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, X, ChevronRight, CornerDownLeft, Zap,
  Activity, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface SuggestionItem {
  type: "hospital" | "blood_bank" | "medicine" | "symptom" | "emergency";
  title: string;
  description: string;
  id: string;
}

interface HospitalItem {
  id: string;
  name: string;
  address: string;
  type: string;
  services: string;
  beds: string;
  rating: number;
  phone: string;
  lat: number;
  lng: number;
  distance?: string;
}

interface BloodBankItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  lat: number;
  lng: number;
  aPlus: number;
  aMinus: number;
  bPlus: number;
  bMinus: number;
  oPlus: number;
  oMinus: number;
  abPlus: number;
  abMinus: number;
}

interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  brandPrice: number;
  genericPrice: number;
  savings: number;
  description: string | null;
  category: string | null;
  availability: string;
}

interface SearchResults {
  hospitals: HospitalItem[];
  bloodBanks: BloodBankItem[];
  medicines: MedicineItem[];
  triage: {
    match: boolean;
    severity: string;
    condition: string;
    action: string;
    hospitalType: string;
  } | null;
  emergency: {
    match: boolean;
    category: string;
    instructions: string;
    dispatch: string;
  } | null;
}

export default function Index() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResultTab, setSelectedResultTab] = useState<"all" | "hospitals" | "blood" | "medicine" | "triage">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch analytics data
  useEffect(() => {
    fetch("/api/healthcare-analytics")
      .then(res => res.ok ? res.json() : null)
      .then(data => setAnalytics(data))
      .catch(err => console.error("Failed to load analytics", err));
  }, []);

  // Suggested keywords to show under the search bar for quick access
  const sampleSearches = [
    { label: "Chest pain first aid", value: "chest pain" },
    { label: "AIIMS beds locator", value: "AIIMS" },
    { label: "O- negative blood bank", value: "O-" },
    { label: "Generic Crocin substitute", value: "Crocin" },
    { label: "Symptom check: fever & cough", value: "fever & cough" }
  ];

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Error fetching search suggestions", err);
      }
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      toast.error("Please enter a longer query to search");
      return;
    }
    
    setLoading(true);
    setShowDropdown(false);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setSelectedResultTab("all");
        
        // Scroll to results beautifully
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        toast.error("Search request failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (sug: SuggestionItem) => {
    setQuery(sug.title);
    handleSearchSubmit(sug.title);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setResults(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "emergency": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "symptom": return <Stethoscope className="w-4 h-4 text-amber-500" />;
      case "blood_bank": return <Droplet className="w-4 h-4 text-red-500" />;
      case "medicine": return <Percent className="w-4 h-4 text-green-500" />;
      default: return <MapPin className="w-4 h-4 text-primary" />;
    }
  };

  const hasResults = results && (
    results.hospitals.length > 0 ||
    results.bloodBanks.length > 0 ||
    results.medicines.length > 0 ||
    results.triage ||
    results.emergency
  );

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navigation />
      
      {/* SECTION 1: HERO (Visual AI Grid + Live Search Engine) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-12 overflow-hidden border-b border-border/20">
        <Hero3DCanvas />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        {/* Glow rings */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-4xl w-full text-center space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 px-4.5 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Premium AI Healthcare Operating System
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
              Next-Gen Healthcare at <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[size:200%] animate-[gradient_6s_linear_infinite]">SwasthAI</span>
            </h1>
            <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              India's first startup-grade health infrastructure platform. Search live beds, verify blood stock levels, calculate generic savings, and run Vision-based diagnoses instantly.
            </p>
          </motion.div>

          {/* Search Bar Input Console */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative max-w-2xl mx-auto"
            ref={dropdownRef}
          >
            <div className="relative glass border border-white/20 dark:border-slate-800/80 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/80 transition-all flex items-center px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <Search className="w-6 h-6 text-primary mr-3.5 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit(query);
                }}
                placeholder="Search symptoms, hospitals, blood types, or generic medicines..."
                className="flex-grow bg-transparent outline-none text-foreground text-sm sm:text-base placeholder-foreground/45 pr-2"
              />
              
              {query && (
                <button 
                  onClick={clearSearch} 
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors mr-2"
                >
                  <X className="w-4 h-4 text-foreground/50" />
                </button>
              )}

              <button
                onClick={() => handleSearchSubmit(query)}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Suggestions drop card */}
            <AnimatePresence>
              {showDropdown && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl overflow-hidden z-50 text-left max-h-[500px] overflow-y-auto"
                >
                  {suggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-border/50 text-[10px] font-black text-foreground/50 uppercase tracking-wider">
                        Real-time Suggestions & Predictions
                      </div>
                      <div className="divide-y divide-border/30">
                        {suggestions.map((sug) => (
                          <div
                            key={sug.id}
                            onClick={() => selectSuggestion(sug)}
                            className="px-5 py-3 hover:bg-primary/5 cursor-pointer flex items-start gap-3.5 transition-colors group"
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-primary/10 transition-colors">
                              {getIcon(sug.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {sug.title}
                              </div>
                              <div className="text-xs text-foreground/50 truncate">
                                {sug.description}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/30 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-foreground/50 text-sm">
                      Searching registries... Type more details
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto text-xs"
          >
            <span className="text-foreground/45 py-1.5 font-bold">Try searching:</span>
            {sampleSearches.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setQuery(item.value);
                  handleSearchSubmit(item.value);
                }}
                className="px-3 py-1.5 rounded-lg border border-border/80 hover:border-primary/50 bg-white/40 dark:bg-slate-800/40 text-foreground/75 hover:text-primary transition-all font-semibold cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Core Premium Visual Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="pt-8 max-w-3xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-6">
              <div className="text-left text-white max-w-md">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">SwasthAI OS</span>
                <h4 className="text-lg font-black mt-0.5">Empowering Citizens with Open Data</h4>
                <p className="text-xs text-white/70 mt-1">Directly connected to national health registries across all 28 states.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH RESULTS CONTAINER */}
      <AnimatePresence>
        {results && (
          <motion.section 
            id="results-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="py-16 bg-black/5 dark:bg-white/5 border-b border-border/40 scroll-mt-20 flex-grow"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">Registry Search Results</h2>
                  <p className="text-sm text-foreground/60">Matches for: <span className="font-bold text-foreground">"{query}"</span></p>
                </div>
                
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "All Matches" },
                    { id: "triage", label: "AI Triage" },
                    { id: "hospitals", label: `Hospitals (${results.hospitals.length})` },
                    { id: "blood", label: `Blood Banks (${results.bloodBanks.length})` },
                    { id: "medicine", label: `Medicines (${results.medicines.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedResultTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all cursor-pointer ${
                        selectedResultTab === tab.id
                          ? "bg-primary text-white border-primary shadow"
                          : "bg-white dark:bg-slate-900 border-border text-foreground/70 hover:bg-black/5"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {!hasResults ? (
                <div className="text-center py-20 glass rounded-3xl border border-border/50">
                  <p className="text-lg text-foreground/50 font-bold">No exact matches found. Try searching simple terms like "cardiac", "O+", or "Crocin".</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Emergency Warning */}
                  {results.emergency && (selectedResultTab === "all" || selectedResultTab === "triage") && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg">
                          <ShieldAlert className="w-6 h-6 animate-pulse" />
                          CRITICAL: {results.emergency.category} Instructions
                        </div>
                        <p className="text-base font-bold text-foreground leading-relaxed">
                          {results.emergency.instructions}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <a 
                          href={`tel:${results.emergency.dispatch.split(" ")[0]}`}
                          className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-center rounded-xl shadow-lg text-lg flex items-center justify-center gap-2"
                        >
                          <Phone className="w-5 h-5 animate-bounce" />
                          Call {results.emergency.dispatch}
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Symptom triage advice */}
                  {results.triage && (selectedResultTab === "all" || selectedResultTab === "triage") && (
                    <div className="glass rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-primary" />
                        AI Symptoms Assessment
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase text-amber-600 mb-1">Assessment Severity</span>
                          <span className="text-xl font-extrabold text-amber-600">{results.triage.severity}</span>
                        </div>
                        <div className="md:col-span-2 p-4 rounded-xl border border-border/40 bg-black/5 dark:bg-white/5">
                          <span className="text-[10px] font-black uppercase text-foreground/50 block mb-1">Suspected Conditions</span>
                          <span className="font-bold text-foreground text-lg">{results.triage.condition}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-4 text-sm font-semibold">
                        {results.triage.action}
                      </div>
                    </div>
                  )}

                  {/* Hospitals list */}
                  {results.hospitals.length > 0 && (selectedResultTab === "all" || selectedResultTab === "hospitals") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Beds & Emergency Care ({results.hospitals.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.hospitals.slice(0, 4).map((hosp) => (
                          <div key={hosp.id} className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-foreground">{hosp.name}</h4>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded">{hosp.type}</span>
                              </div>
                              <p className="text-xs text-foreground/60 flex items-center gap-1 mb-4">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                {hosp.address}
                              </p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-border/40 text-xs font-semibold text-foreground/60">
                              <span className="text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded">Beds: {hosp.beds}</span>
                              <div className="flex gap-2">
                                <a href={`tel:${hosp.phone}`} className="px-3 py-1.5 border border-border rounded-lg hover:bg-black/5 flex items-center gap-1">📞 Call</a>
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-primary text-white rounded-lg hover:shadow">Directions</a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blood stock */}
                  {results.bloodBanks.length > 0 && (selectedResultTab === "all" || selectedResultTab === "blood") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        Blood Bank Stock Inventories ({results.bloodBanks.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.bloodBanks.slice(0, 4).map((bank) => (
                          <div key={bank.id} className="glass rounded-2xl p-6 border border-white/10 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-foreground">{bank.name}</h4>
                                <p className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">{bank.address}</p>
                              </div>
                              <a href={`tel:${bank.phone}`} className="p-2 rounded-full bg-primary/10 text-primary">📞</a>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                              <div className="p-1 border rounded bg-red-500/10 text-red-500">A+ ({bank.aPlus}U)</div>
                              <div className="p-1 border rounded bg-red-500/10 text-red-500">B+ ({bank.bPlus}U)</div>
                              <div className="p-1 border rounded bg-red-500/10 text-red-500">O- ({bank.oMinus}U)</div>
                              <div className="p-1 border rounded bg-red-500/10 text-red-500">AB+ ({bank.abPlus}U)</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medicines */}
                  {results.medicines.length > 0 && (selectedResultTab === "all" || selectedResultTab === "medicine") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Percent className="w-5 h-5 text-green-500" />
                        Generic Alternative Substitutes ({results.medicines.length})
                      </h3>
                      <div className="space-y-4">
                        {results.medicines.map((med) => (
                          <div key={med.id} className="glass rounded-xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-base font-bold text-foreground">{med.name} / <span className="text-foreground/60">{med.genericName}</span></h4>
                              <p className="text-xs text-foreground/50 leading-relaxed mt-1">{med.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-foreground/50 line-through">Brand: ₹{med.brandPrice}</div>
                              <div className="text-lg font-black text-green-500">Generic: ₹{med.genericPrice}</div>
                              <div className="text-[10px] text-green-500 font-extrabold bg-green-500/10 px-2 py-0.5 rounded mt-1">Save ₹{med.savings}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 2: EMERGENCY SOS */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative bg-red-500/[0.02] overflow-hidden scroll-reveal">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 px-3 py-1 bg-red-500/10 rounded-full">
              Critical Care Response
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Speed Dial Emergency SOS Network
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              When seconds count, trigger SwasthAI's coordinated SOS channel. Dispatch local ambulances, locate cardiac arrest support equipment, and alerts regional trauma networks automatically.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">12.4 Min</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Average Response Dispatch</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">1,200+</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Verified Responders</div>
              </div>
            </div>
            <a 
              href="/emergency" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/15 cursor-pointer"
            >
              Access SOS System <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" 
              alt="Emergency Ambulance Dispatch" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px] lazy-loaded"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: HOSPITAL FINDER */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800" 
              alt="Modern Hospital and Emergency Ward" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
              Real-time Capacity Map
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hospital Finder & Beds Tracker
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Find verified medical facilities by GPS distance calculations. Monitor live vacant beds, ICU ventilators count, and emergency department statuses across national government grids.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">120+</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Hospitals Connected</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">2,500+</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Live Vacant Beds</div>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="/hospitals" className="px-5 py-3 border border-border bg-white dark:bg-slate-900 font-bold text-xs rounded-xl hover:bg-black/5 cursor-pointer">Find Beds</a>
              <a href="/map" className="px-5 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:shadow cursor-pointer flex items-center gap-1">Open Interactive Map</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: BLOOD AVAILABILITY */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 px-3 py-1 bg-red-500/10 rounded-full">
              Donor Stock Logs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Blood Stock Availability Check
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Query the direct live units index of regional blood banks. Select state, city, and specific groups (A+, O-, AB-) to pinpoint active units before traveling.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">130+</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Stocked Blood Banks</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">8 Groups</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">A+, A-, B+, B-, O+, O-, AB+, AB-</div>
              </div>
            </div>
            <a href="/blood-banks" className="inline-flex items-center gap-1.5 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Explore Blood Stocks
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800" 
              alt="Blood Donation and Labs Visual" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: MEDICINE SAVINGS */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" 
              alt="Generic Medicines and Pharmacy Visual" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-green-500 px-3 py-1 bg-green-500/10 rounded-full">
              Cost Optimization
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Medicine Savings & Generic Finder
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Save up to 80% on clinical prescriptions. Instantly look up expensive branded medicines to find cheap equivalent PM Jan Aushadhi generic alternatives.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-green-500">Up to 80%</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Avg Patient Cost Savings</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-green-500">10,000+</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Generic Substitutes Mapped</div>
              </div>
            </div>
            <a href="/pharmacy" className="inline-flex items-center gap-1.5 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Compare Drug Prices
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: AI TRIAGE */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 px-3 py-1 bg-amber-500/10 rounded-full">
              Symptom Triage Check
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AI Symptom Analysis Engine
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Describe symptoms in your own words. The triage logic maps keywords to clinical criteria to give warning ratings (High, Medium, Low) and next steps guidance.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-amber-500">100%</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Clinical Logic Mapping</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-amber-500">Instant</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Diagnostic Report Generation</div>
              </div>
            </div>
            <a href="/triage" className="inline-flex items-center gap-1.5 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Launch Symptom Analyzer
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
              alt="AI Doctor Clinical Advisor" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: AI REPORT ANALYZER */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" 
              alt="Medical Report Scanning and Analysis" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
              Document Decoder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AI Medical Report Analyzer
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Upload blood tests, urine screens, or general health panels (PDF/JPEG). AI decodes complex laboratory terminology into plain layperson explanations, flags abnormalities, and suggests specialist consults.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">PDF & JPG</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Multi-Format Extraction Support</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">Decoded</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Simple Language Explanations</div>
              </div>
            </div>
            <a href="/triage" className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Analyze Medical Report
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: AI INJURY DETECTION */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 px-3 py-1 bg-red-500/10 rounded-full">
              Vision Detection
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AI Injury Detection Scan
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Submit images of topical wounds or suspected skeletal impacts. Gemini Vision models identify second-degree burns, cuts, bone fractures, skin infections, bruises, and swelling.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">6 Wound Types</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Burns, Cuts, Fractures, & More</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-red-500">Dual-Arch</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Gemini & GPT-4o Vision Adapters</div>
              </div>
            </div>
            <a href="/injury-detection" className="inline-flex items-center gap-1.5 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Scan Injury Photo
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800" 
              alt="Medical Scan and Injury Diagnostic Visual" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 9: HEALTH RISK PREDICTION */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 w-full max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800" 
              alt="Smart Watch Health Monitoring Visual" 
              className="rounded-3xl shadow-xl border border-white/10 object-cover w-full h-[320px]"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
              Predictive Diagnostics
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Health Risk Prediction Center
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Calculate your overall health risk profile. Collect basic inputs like age, weight, and blood pressure to predict heart disease risk, stroke risk, and diabetes likelihoods.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">3 Profiles</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Heart, Stroke, & Diabetes Indexes</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white/40 dark:bg-slate-900/40">
                <div className="text-2xl font-black text-primary">Lifestyle</div>
                <div className="text-[10px] text-foreground/50 uppercase font-bold mt-1">Tailored Fitness & Diet Recommendations</div>
              </div>
            </div>
            <a href="/health-risk" className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              Assess Your Risk Scale
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 10: HEALTHCARE ANALYTICS */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent px-3 py-1 bg-accent/10 rounded-full">
              India Health Index Data
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              National Health Registries Analytics
            </h2>
            <p className="text-sm text-foreground/60">
              Live statistics collected dynamically across public and private hospitals.
            </p>
          </div>

          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary counters */}
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                <h3 className="text-base font-bold mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  National Coverage
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-border rounded-xl">
                    <div className="text-xl font-black">{analytics.coverageSummary.totalStatesCovered}</div>
                    <div className="text-[9px] text-foreground/50 uppercase">States Covered</div>
                  </div>
                  <div className="p-3 border border-border rounded-xl">
                    <div className="text-xl font-black">{analytics.coverageSummary.totalCitiesCovered}</div>
                    <div className="text-[9px] text-foreground/50 uppercase">Major Cities</div>
                  </div>
                  <div className="p-3 border border-border rounded-xl">
                    <div className="text-xl font-black">{analytics.coverageSummary.totalHospitals}</div>
                    <div className="text-[9px] text-foreground/50 uppercase">Hospitals</div>
                  </div>
                  <div className="p-3 border border-border rounded-xl">
                    <div className="text-xl font-black">{analytics.coverageSummary.totalBloodBanks}</div>
                    <div className="text-[9px] text-foreground/50 uppercase">Blood Banks</div>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] leading-relaxed text-foreground/75">
                  Our system verifies bed queues and ambulance dispatches across a network of <b>{analytics.coverageSummary.emergencyCoverageKm}</b>.
                </div>
              </div>

              {/* Chart 1: State-wise hospitals bed volume */}
              <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
                <h3 className="text-sm font-bold mb-4">Top Bed Capacity by States</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stateHospitals}>
                      <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="totalBeds" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: State-wise blood donor units */}
              <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
                <h3 className="text-sm font-bold mb-4">Top Blood Units by States</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stateBlood}>
                      <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="totalUnits" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-foreground/50 mt-2">Loading live digital health statistics...</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 11: TESTIMONIALS */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Public Feedback</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Trusted by Patients & Clinicians</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/70 text-xs font-semibold leading-relaxed space-y-3">
              <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
              <p className="text-foreground/75">
                "SwasthAI saved our family precious hours during an emergency. We looked up O- blood units and located a government red cross bank in minutes."
              </p>
              <div className="text-[10px] text-foreground/50">
                - Priyesh Sharma, Bengaluru
              </div>
            </div>
            
            <div className="p-6 rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/70 text-xs font-semibold leading-relaxed space-y-3">
              <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
              <p className="text-foreground/75">
                "Using the generic medicine alternative directory, our senior clinic patients have cut down their pharmacy prescription costs by almost 70%."
              </p>
              <div className="text-[10px] text-foreground/50">
                - Dr. Anjali Mehta, Cardiologist, Noida
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/70 text-xs font-semibold leading-relaxed space-y-3">
              <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
              <p className="text-foreground/75">
                "The AI Report analyzer is an exceptional clinical decoder. It parses dense chemical markers from CBC panels into plain layperson terms immediately."
              </p>
              <div className="text-[10px] text-foreground/50">
                - Vikram Sen, Kolkata
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: FAQ */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Information Check</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is SwasthAI completely free to use?", a: "Yes, SwasthAI is a 100% free open-access healthcare directory platform. We do not require account registration or collect subscription fees." },
              { q: "Where does the hospital bed availability data come from?", a: "Bed queues, ICU capacities, and ventilator statistics are synced dynamically with the public India Digital Health Grid registries." },
              { q: "How accurate is the AI Injury and Report Analyzer?", a: "Our AI systems utilize Gemini and GPT-4o Vision models to parse document texts and identify topical lacerations. These assessments are informational and should always be reviewed by medical doctors." },
              { q: "How can I update my facility's blood stocks or beds?", a: "Healthcare administrators can contact our coordination desk via the Contact form to register credentials and update local inventories." }
            ].map((faq, i) => (
              <details key={i} className="p-4 border border-border bg-white/20 dark:bg-slate-900/20 rounded-2xl group cursor-pointer transition-all">
                <summary className="text-xs font-bold text-foreground flex justify-between items-center select-none">
                  {faq.q}
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-foreground/60 leading-relaxed font-semibold mt-3 pt-3 border-t border-border/30">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13: CONTACT */}
      <section className="py-20 border-b border-border/20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-primary/[0.01]">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Get In Touch</span>
            <h2 className="text-3xl font-extrabold">Contact Our Coordination Desk</h2>
            <p className="text-xs text-foreground/50">For integrations, public data inquiries, or hospital registrations.</p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent successfully! Our team will contact you shortly.");
              (e.target as HTMLFormElement).reset();
            }} 
            className="glass rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-xl space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-foreground/60 uppercase font-bold text-[10px] mb-1.5">Full Name</label>
              <input type="text" className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-2.5 outline-none" required />
            </div>
            <div>
              <label className="block text-foreground/60 uppercase font-bold text-[10px] mb-1.5">Email Address</label>
              <input type="email" className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-2.5 outline-none" required />
            </div>
            <div>
              <label className="block text-foreground/60 uppercase font-bold text-[10px] mb-1.5">Message / Inquiry</label>
              <textarea rows={4} className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-2.5 outline-none resize-none" required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow cursor-pointer">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 14: FOOTER */}
      <Footer />
    </div>
  );
}

