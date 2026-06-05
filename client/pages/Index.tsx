import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, ShieldAlert, Heart, Stethoscope, Droplet, 
  MapPin, Phone, Star, Percent, Sparkles, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, X, ChevronRight, CornerDownLeft, Zap
} from "lucide-react";
import { toast } from "sonner";

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

  // Check if any results were found
  const hasResults = results && (
    results.hospitals.length > 0 ||
    results.bloodBanks.length > 0 ||
    results.medicines.length > 0 ||
    results.triage ||
    results.emergency
  );

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      
      {/* 1. Hero Search Area */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
        {/* Modern grid & glow accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl w-full text-center space-y-8 z-10">
          {/* Logo Brand Title */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2.5 bg-primary/10 dark:bg-primary/25 border border-primary/20 px-4 py-1.5 rounded-full">
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Open Healthcare Search Grid
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[size:200%] animate-[gradient_6s_linear_infinite]">
                SwasthAI
              </span>
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 max-w-lg mx-auto">
              India's first completely public healthcare search engine. Find verified beds, blood stocks, drug pricing, and AI-first symptoms advice instantly.
            </p>
          </motion.div>

          {/* Core Feature: Large Search Bar with Autocomplete suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative max-w-2xl mx-auto"
            ref={dropdownRef}
          >
            {/* Search Input Box */}
            <div className="relative glass border border-white/20 dark:border-slate-800/80 rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/80 transition-all flex items-center px-5 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
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
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-black rounded-lg hover:shadow-lg transition-all"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Dropdown containing suggestions & predicted instant answers */}
            <AnimatePresence>
              {showDropdown && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl overflow-hidden z-50 text-left max-h-[550px] overflow-y-auto"
                >
                  {/* Suggestions List */}
                  {suggestions.length > 0 ? (
                    <div>
                      {/* Top Header */}
                      <div className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border-b border-border/50 text-[10px] font-black text-foreground/50 uppercase tracking-wider">
                        Real-time Suggestions & Predictions
                      </div>
                      
                      {/* Suggestions Rows */}
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

                  {/* PREDICTED INSTANT ANSWERS (At least 2 relevant predicted answers before full search) */}
                  {suggestions.length > 0 && (
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 border-t border-border">
                      <div className="text-[10px] font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        AI Instant Assessment Predictions
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Instant Prediction Card 1: Symptoms Triage */}
                        {suggestions.some(s => s.type === "symptom") ? (
                          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-white/80 dark:bg-slate-900/80 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-extrabold mb-1">
                                <Stethoscope className="w-3.5 h-3.5" />
                                Triage Check Summary
                              </div>
                              <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                                Matches severe symptoms indicators. Access emergency clinical targets and home treatment guidelines.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleSearchSubmit(query)}
                              className="mt-3 text-[10px] font-black text-primary hover:underline flex items-center gap-1 text-left"
                            >
                              Open Triage Advice
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl border border-border bg-white/50 dark:bg-slate-900/50 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Facility Search
                              </div>
                              <p className="text-xs text-foreground/50 leading-relaxed">
                                Locate nearest public and private beds and calculate exact travel duration from your device coordinates.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleSearchSubmit(query)}
                              className="mt-3 text-[10px] font-bold text-primary hover:underline text-left"
                            >
                              Explore Beds
                            </button>
                          </div>
                        )}

                        {/* Instant Prediction Card 2: Emergency guidelines or medicine savings */}
                        {suggestions.some(s => s.type === "emergency") ? (
                          <div className="p-3.5 rounded-xl border border-red-500/20 bg-white/80 dark:bg-slate-900/80 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-red-500 text-xs font-extrabold mb-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Critical First-Aid Info
                              </div>
                              <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                                Immediate actions required: Keep airway clear. Do not administer oral medicine. Dial 108 speed hotlines.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleSearchSubmit(query)}
                              className="mt-3 text-[10px] font-black text-red-500 hover:underline flex items-center gap-1 text-left"
                            >
                              See First Aid Guide
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : suggestions.some(s => s.type === "medicine") ? (
                          <div className="p-3.5 rounded-xl border border-green-500/20 bg-white/80 dark:bg-slate-900/80 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-green-500 text-xs font-extrabold mb-1">
                                <Percent className="w-3.5 h-3.5" />
                                Generic Price Alternatives
                              </div>
                              <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                                Matches branded medicines with cheap PM Jan Aushadhi equivalents. Save up to 80% on billing.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleSearchSubmit(query)}
                              className="mt-3 text-[10px] font-black text-green-500 hover:underline flex items-center gap-1 text-left"
                            >
                              Open Savings Panel
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl border border-border bg-white/50 dark:bg-slate-900/50 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
                                <Droplet className="w-3.5 h-3.5" />
                                Blood Stocks
                              </div>
                              <p className="text-xs text-foreground/50 leading-relaxed">
                                Query regional stock units for O-, A+, AB- blood groups across nearest partner blood bank centers.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleSearchSubmit(query)}
                              className="mt-3 text-[10px] font-bold text-primary hover:underline text-left"
                            >
                              View Stocks
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Search keywords */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto text-xs"
          >
            <span className="text-foreground/45 py-1.5">Try searching:</span>
            {sampleSearches.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setQuery(item.value);
                  handleSearchSubmit(item.value);
                }}
                className="px-3 py-1.5 rounded-lg border border-border/80 hover:border-primary/50 bg-white/40 dark:bg-slate-800/40 text-foreground/75 hover:text-primary transition-all font-semibold"
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Public Trust Banner */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-6 border-t border-border/30 max-w-lg mx-auto flex justify-center gap-8 text-[11px] font-semibold text-foreground/50"
          >
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              100% Free & Open Access
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              No Registration Required
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-primary" />
              Verified Proximity Match
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Results Display Section */}
      <AnimatePresence>
        {results && (
          <motion.section 
            id="results-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="py-16 bg-black/5 dark:bg-white/5 border-t border-border/40 scroll-mt-20 flex-grow"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">Search Results</h2>
                  <p className="text-sm text-foreground/60">Results matching query: <span className="font-bold text-foreground">"{query}"</span></p>
                </div>
                
                {/* Result tabs */}
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
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
                  <p className="text-lg text-foreground/50 font-bold">No exact matches found. Try widening your query.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* EMERGENCY FIRST AID (Always topmost results if matching) */}
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
                        <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                          First aid action protocols configured in coordination with national health networks.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="text-xs font-black text-foreground/50 uppercase">Emergency Dispatch</div>
                        <a 
                          href={`tel:${results.emergency.dispatch.split(" ")[0]}`}
                          className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-center rounded-xl shadow-lg shadow-red-600/20 text-lg flex items-center justify-center gap-2"
                        >
                          <Phone className="w-5 h-5 animate-bounce" />
                          Call {results.emergency.dispatch}
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* CLINICAL SYMPTOMS TRIAGE DIAGNOSIS */}
                  {results.triage && (selectedResultTab === "all" || selectedResultTab === "triage") && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6 border border-white/20"
                    >
                      <h3 className="text-xl font-bold mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-primary" />
                        AI Symptoms Assessment
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 mb-1">Assessment Severity</span>
                          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500">{results.triage.severity}</span>
                        </div>
                        
                        <div className="md:col-span-2 p-4 rounded-xl border border-border/40 bg-black/5 dark:bg-white/5">
                          <span className="text-[10px] font-black uppercase text-foreground/50 block mb-1">Suspected Conditions</span>
                          <span className="font-bold text-foreground text-lg">{results.triage.condition}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                        <div className="text-sm font-bold text-primary mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-4.5 h-4.5" />
                          Recommended Action Guidelines
                        </div>
                        <p className="text-sm font-semibold text-foreground">{results.triage.action}</p>
                      </div>

                      <div className="text-xs text-amber-600 dark:text-amber-500 font-bold bg-amber-500/10 p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Note: Symptoms analysis utilizes static triage logic rules. Consult doctors for prescription.
                      </div>
                    </motion.div>
                  )}

                  {/* HOSPITALS & TRAUMA BEDS */}
                  {results.hospitals.length > 0 && (selectedResultTab === "all" || selectedResultTab === "hospitals") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Nearest Bed Availability ({results.hospitals.length})
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.hospitals.map((hosp) => (
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
                              
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {hosp.services.split(", ").slice(0, 3).map((serv) => (
                                  <span key={serv} className="text-[9px] font-semibold bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded-full">{serv}</span>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-border/40 text-xs font-semibold text-foreground/60">
                              <span className="text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded">Beds: {hosp.beds}</span>
                              <div className="flex gap-2">
                                <a 
                                  href={`tel:${hosp.phone}`}
                                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-black/5 flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  Call
                                </a>
                                <a 
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-primary text-white rounded-lg hover:shadow flex items-center gap-1"
                                >
                                  Directions
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BLOOD BANK STOCKS INVENTORY */}
                  {results.bloodBanks.length > 0 && (selectedResultTab === "all" || selectedResultTab === "blood") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        Blood Bank Stock Registries ({results.bloodBanks.length})
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.bloodBanks.map((bank) => (
                          <div key={bank.id} className="glass rounded-2xl p-6 border border-white/10 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-foreground">{bank.name}</h4>
                                <p className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                  {bank.address}, {bank.city}
                                </p>
                              </div>
                              <a 
                                href={`tel:${bank.phone}`} 
                                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            </div>

                            {/* Units inventory grid */}
                            <div className="grid grid-cols-8 gap-1 text-center text-[10px] font-bold">
                              {[
                                { t: "A+", v: bank.aPlus },
                                { t: "A-", v: bank.aMinus },
                                { t: "B+", v: bank.bPlus },
                                { t: "B-", v: bank.bMinus },
                                { t: "O+", v: bank.oPlus },
                                { t: "O-", v: bank.oMinus },
                                { t: "AB+", v: bank.abPlus },
                                { t: "AB-", v: bank.abMinus },
                              ].map(unit => (
                                <div key={unit.t} className={`p-1 border rounded ${unit.v > 0 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-black/5 dark:bg-white/5 border-border text-foreground/30"}`}>
                                  <div>{unit.t}</div>
                                  <div className="text-xs font-extrabold mt-0.5">{unit.v > 0 ? `${unit.v}U` : "0"}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MEDICINE GENERIC ALTERNATIVES COMPARISON */}
                  {results.medicines.length > 0 && (selectedResultTab === "all" || selectedResultTab === "medicine") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Percent className="w-5 h-5 text-green-500" />
                        Generic Alternative Substitutes ({results.medicines.length})
                      </h3>
                      
                      <div className="space-y-4">
                        {results.medicines.map((med) => (
                          <div key={med.id} className="glass rounded-xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 max-w-xl">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-foreground">{med.name}</h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{med.category || "General"}</span>
                              </div>
                              <p className="text-xs text-foreground/60">
                                Generic Active Compound: <span className="font-bold text-foreground">{med.genericName}</span>
                              </p>
                              <p className="text-xs text-foreground/50 leading-relaxed mt-1">{med.description}</p>
                            </div>

                            <div className="flex items-center gap-4 justify-between sm:justify-end sm:border-l border-border/40 sm:pl-6">
                              <div className="text-right">
                                <div className="text-xs text-foreground/50 line-through">₹{med.brandPrice.toFixed(2)}</div>
                                <div className="text-lg font-black text-green-500">₹{med.genericPrice.toFixed(2)}</div>
                                <div className="text-[10px] text-green-500 font-extrabold bg-green-500/10 px-2 py-0.5 rounded mt-1">
                                  Save ₹{med.savings.toFixed(2)} ({Math.round(((med.brandPrice - med.genericPrice) / med.brandPrice) * 100)}%)
                                </div>
                              </div>
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

      <Footer />
    </div>
  );
}
