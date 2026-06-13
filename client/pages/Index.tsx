import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import SwasthAIParticleText from "@/components/SwasthAIParticleText";
import InteractiveBackground from "@/components/InteractiveBackground";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShieldAlert, Heart, Stethoscope, Droplet, 
  MapPin, Phone, Star, Percent, Sparkles, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, X, ChevronRight, CornerDownLeft, Zap,
  Activity, RefreshCw, Terminal, CheckCircle2, AlertCircle
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

const testimonials = [
  {
    name: "Dr. Aarav Mehta",
    role: "Cardiologist, Delhi",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
    content: "SwasthAI's live beds database has changed how we handle emergency patient routing. True digital infrastructure.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    content: "Found generic substitutes and saved over 75% on my monthly prescription. The medicine finder is a lifesaver!",
    rating: 5
  },
  {
    name: "Dr. Vikram Sen",
    role: "Trauma Specialist, Kolkata",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150",
    content: "AI Symptom Triage assessment is surprisingly accurate. It guides patients to critical care settings exactly when needed.",
    rating: 5
  },
  {
    name: "Ananya Iyer",
    role: "Health Blogger, Chennai",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    content: "The AI Report Explainer decoded my CBC panel in seconds. Simple layout, extremely powerful layperson translations.",
    rating: 5
  },
  {
    name: "Rohan Das",
    role: "Patient Advocate, Mumbai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    content: "Checked O- negative stock at multiple Delhi banks instantly during a critical surgery. Outstanding coverage.",
    rating: 5
  },
  {
    name: "Dr. Sneha Patil",
    role: "Pediatrician, Pune",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150",
    content: "Vision wound detection scanner parsed our mock infection photo accurately in seconds. Highly impressive utility.",
    rating: 5
  },
  {
    name: "Rajesh Nair",
    role: "Retired Officer, Kochi",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    content: "The vitals health index calculator is a very practical tool. It keeps my daily health profile in focus.",
    rating: 5
  },
  {
    name: "Meera Deshmukh",
    role: "Clinical Director, Hyderabad",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    content: "Coordinating ambulance emergency SOS network dynamically is what India's healthcare grid has been missing.",
    rating: 5
  }
];

const TestimonialCard = ({ card, isDup = false }: { card: typeof testimonials[0]; isDup?: boolean }) => {
  return (
    <div 
      className="w-[280px] sm:w-[320px] p-6 bg-card/60 dark:bg-zinc-900/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_30px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-zinc-300 dark:hover:border-zinc-700/65 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 flex-shrink-0 cursor-pointer"
      aria-hidden={isDup ? "true" : undefined}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-0.5">
          {[...Array(card.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
          "{card.content}"
        </p>
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-border/30">
        <img 
          src={card.avatar} 
          alt={card.name} 
          className="w-9 h-9 rounded-full object-cover border border-zinc-200/80 dark:border-zinc-800 shadow-sm"
        />
        <div>
          <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">{card.name}</h4>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{card.role}</span>
        </div>
      </div>
    </div>
  );
};

export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResultTab, setSelectedResultTab] = useState<"all" | "hospitals" | "blood" | "medicine" | "triage">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const console3DRef = useRef<HTMLDivElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // macOS simulation state machine
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned' | 'executing' | 'approved' | 'held' | 'denied'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const logIntervalRef = useRef<any>(null);

  const startScan = () => {
    if (scanState !== 'idle') return;
    setScanState('scanning');
    setConsoleLogs([]);
    setProgress(0);
    
    const logs = [
      "Initializing SwasthAI central zone registry scan...",
      "Connecting to National Digital Health Grid node [ND-DEL-40]...",
      "Querying regional emergency bed queue database...",
      "AIIMS Central Emergency: 8 vacant ICU beds verified.",
      "Safdarjung Trauma: 4 vacant beds verified.",
      "Checking regional blood bank inventories for O-negative group...",
      "Red Cross Delhi: 42 units verified [Active Stock].",
      "Rotary Blood Bank: 12 units verified [Active Stock].",
      "Scanning national drug safety registry for generic Crocin...",
      "Matching generic options: Paracetamol 500mg, Calpol, Dolo 650.",
      "Savings Index calculated: 78.4% brand cost reduction.",
      "Intake assessment profile compiled successfully."
    ];
    
    let index = 0;
    logIntervalRef.current = setInterval(() => {
      if (index < logs.length) {
        setConsoleLogs(prev => [...prev, logs[index]]);
        setProgress(Math.round(((index + 1) / logs.length) * 100));
        index++;
      } else {
        clearInterval(logIntervalRef.current);
        setScanState('scanned');
        toast.success("Scan complete: Registry resources compiled.");
      }
    }, 250);
  };

  const startExecute = () => {
    if (scanState !== 'scanned') return;
    setScanState('executing');
    setConsoleLogs([]);
    setProgress(0);
    
    const logs = [
      "Acquiring clinical signature authorization...",
      "Broadcasting encrypted dispatch packet to regional trauma dispatch...",
      "Locking ICU Bed ID [E-402] at AIIMS Emergency ward...",
      "Reserving 2 units of O-negative blood at Red Cross Delhi...",
      "Generating digital pharmacy coupon for generic substitution...",
      "Coordinated emergency channel established.",
      "SUCCESS: Dispatch route dispatched to responder mobile unit."
    ];
    
    let index = 0;
    logIntervalRef.current = setInterval(() => {
      if (index < logs.length) {
        setConsoleLogs(prev => [...prev, logs[index]]);
        setProgress(Math.round(((index + 1) / logs.length) * 100));
        index++;
      } else {
        clearInterval(logIntervalRef.current);
        setScanState('approved');
        toast.success("Dispatch Approved and Executed!");
      }
    }, 250);
  };

  const resetSimulation = () => {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
    }
    setScanState('idle');
    setConsoleLogs([]);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, []);

  // Fetch analytics data
  useEffect(() => {
    fetch("/api/healthcare-analytics")
      .then(res => res.ok ? res.json() : null)
      .then(data => setAnalytics(data))
      .catch(err => console.error("Failed to load analytics", err));
  }, []);

  // 3D Floating/Tilt effect for Active Registry Scan
  useEffect(() => {
    const card = console3DRef.current;
    if (!card) return;

    // Default static pose
    card.style.transform = "perspective(1200px) rotateY(-8deg) rotateX(4deg)";
    card.style.boxShadow = "30px 30px 80px rgba(0, 0, 0, 0.45)";

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Cursor position relative to center of the card
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      // Normalized offsets (-1 to 1)
      const normX = mouseX / (width / 2);
      const normY = mouseY / (height / 2);

      // Map offset to rotation range (-12deg to +12deg)
      const degX = -normY * 12;
      const degY = normX * 12;

      // Dynamic shadow offset based on tilt position for realistic lighting
      const shadowX = 30 - normX * 15;
      const shadowY = 30 - normY * 15;

      // Apply fast tracking transition on mouse move
      card.style.transition = "transform 0.1s ease-out, box-shadow 0.15s ease-out";
      card.style.transform = `perspective(1200px) rotateX(${degX}deg) rotateY(${degY}deg)`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px 80px rgba(0, 0, 0, 0.55)`;
    };

    const handleMouseLeave = () => {
      // Smooth reset transition back to static pose
      card.style.transition = "transform 0.4s ease-out, box-shadow 0.4s ease-out";
      card.style.transform = "perspective(1200px) rotateY(-8deg) rotateX(4deg)";
      card.style.boxShadow = "30px 30px 80px rgba(0, 0, 0, 0.45)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
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
    <div className="relative w-full min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden grid-bg">
      <InteractiveBackground />
      <Navigation />
      
      {/* SECTION 1: HERO (Clean Tech Layout + Spotlight Search Engine) */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-28 pb-12 overflow-hidden border-b border-border bg-background/60">
        
        <div className="max-w-4xl w-full text-center space-y-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              INDIA'S DIGITAL HEALTH INFRASTRUCTURE
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Next-Gen Healthcare <br />
              at <SwasthAIParticleText />
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              India's digital health infrastructure platform. Search live hospital beds, verify blood stock registries, and run Vision-based diagnoses instantly.
            </p>
          </motion.div>

          {/* Search Bar Input Console */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative max-w-xl mx-auto"
            ref={dropdownRef}
          >
            <div className="relative border border-border rounded-xl shadow-sm focus-within:border-muted-foreground transition-all flex items-center px-4 py-3 bg-card">
              <Search className="w-5 h-5 text-muted-foreground mr-3.5 flex-shrink-0" />
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
                className="flex-grow bg-transparent outline-none text-foreground text-sm placeholder-muted-foreground pr-2"
              />
              
              {query && (
                <button 
                  onClick={clearSearch} 
                  className="p-1 rounded-full hover:bg-muted transition-colors mr-2"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}

              <button
                onClick={() => handleSearchSubmit(query)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background hover:opacity-90 text-xs font-semibold rounded-lg transition-colors"
              >
                <span>SEARCH</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* Suggestions drop card */}
            <AnimatePresence>
              {showDropdown && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 text-left max-h-[400px] overflow-y-auto"
                >
                  {suggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-muted border-b border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Real-time Suggestions & Predictions
                      </div>
                      <div className="divide-y divide-border">
                        {suggestions.map((sug) => (
                          <div
                            key={sug.id}
                            onClick={() => selectSuggestion(sug)}
                            className="px-4 py-2.5 hover:bg-muted/50 cursor-pointer flex items-start gap-3 transition-colors group"
                          >
                            <div className="mt-0.5 p-1.5 rounded bg-muted group-hover:bg-border transition-colors">
                              {getIcon(sug.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-foreground/80 truncate group-hover:text-foreground transition-colors">
                                {sug.title}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {sug.description}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-muted-foreground text-xs font-medium">
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
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto text-[10px]"
          >
            <span className="text-muted-foreground py-1 font-bold">Try searching:</span>
            {sampleSearches.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setQuery(item.value);
                  handleSearchSubmit(item.value);
                }}
                className="px-2.5 py-1 rounded-full border border-border hover:border-muted-foreground bg-card text-muted-foreground hover:text-foreground transition-all font-semibold cursor-pointer shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Simulated macOS Window Pane for clinical status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl mx-auto mt-16 text-left"
            style={{ perspective: 1200 }}
          >
            <div
              ref={console3DRef}
              className="bg-card border border-border rounded-lg overflow-hidden text-left"
              style={{
                transformStyle: "preserve-3d",
                transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
                boxShadow: "30px 30px 80px rgba(0, 0, 0, 0.45)",
                transition: "transform 0.4s ease-out, box-shadow 0.4s ease-out",
              }}
            >
              {/* macOS Window Header Bar */}
              <div 
                className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border"
                style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
              >
                <div className="flex items-center space-x-2" style={{ transform: "translateZ(10px)" }}>
                  <div className="w-2 h-2 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                  <div className="w-2 h-2 rounded-full bg-green-500/80" />
                  <span className="text-[10px] text-muted-foreground font-mono pl-3">Active Registry Scan</span>
                </div>
                <button
                  onClick={startScan}
                  disabled={scanState !== 'idle'}
                  style={{ transform: "translateZ(15px)" }}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all flex items-center gap-1 cursor-pointer ${
                    scanState === 'idle'
                      ? "bg-primary text-primary-foreground animate-pulse hover:opacity-90"
                      : "text-muted-foreground"
                  }`}
                >
                  {scanState === 'scanning' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                  {scanState === 'idle' ? "TAP TO SCAN" : scanState === 'scanning' ? "SCANNING..." : "SCAN COMPLETED"}
                </button>
              </div>
              
              {/* macOS Window Body Content */}
              <div 
                className="min-h-[260px] p-6 bg-background/40 relative"
                style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
              >
                {scanState === 'scanning' || scanState === 'executing' ? (
                  // Terminal Scan / Execute view
                  <div 
                    className="font-mono text-xs space-y-2 text-foreground/90 h-full flex flex-col justify-between"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] pb-1" style={{ transform: "translateZ(10px)" }}>
                        <Terminal className="w-3.5 h-3.5 animate-pulse text-primary" />
                        <span>SwasthAI Console Session v2.6 // {scanState === 'scanning' ? "REGISTRY_SCAN" : "DISPATCH_EXECUTE"}</span>
                      </div>
                      {consoleLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2" style={{ transform: "translateZ(5px)" }}>
                          <span className="text-primary font-bold select-none">&gt;</span>
                          <span className="leading-relaxed">{log}</span>
                        </div>
                      ))}
                      <div className="w-1.5 h-3.5 bg-foreground/75 inline-block animate-pulse ml-5" />
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-1 pt-4 border-t border-border mt-auto" style={{ transform: "translateZ(15px)" }}>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                        <span>{scanState === 'scanning' ? "COMPILING HEALTH GRID REGISTRIES" : "ESTABLISHING EMERGENCY CHANNEL"}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-150" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ) : scanState === 'approved' ? (
                  // Success Dispatch Panel
                  <div 
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                    style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1" style={{ transform: "translateZ(25px)" }}>
                      <h4 className="text-base font-bold text-foreground">Intake Confirmed & Dispatched</h4>
                      <p className="text-xs text-muted-foreground max-w-md">
                        Emergency coordinated channel has been verified. Route data dispatched to responder mobile unit.
                      </p>
                    </div>
                    <div 
                      className="grid grid-cols-2 gap-4 text-left w-full max-w-sm p-4 rounded-lg border border-border bg-card"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase block">Dispatch Code</span>
                        <span className="text-xs font-bold font-mono text-foreground">SA-2026-X83B</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase block">ICU Bed Lock ID</span>
                        <span className="text-xs font-bold font-mono text-foreground">AIIMS E-402</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase block">O-Neg Blood Stock</span>
                        <span className="text-xs font-bold font-mono text-foreground">2 Units Reserved</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase block">Trauma Unit Status</span>
                        <span className="text-xs font-bold font-mono text-emerald-500">Alerted & Active</span>
                      </div>
                    </div>
                    <button
                      onClick={resetSimulation}
                      style={{ transform: "translateZ(15px)" }}
                      className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Simulation
                    </button>
                  </div>
                ) : scanState === 'held' ? (
                  // Held state view
                  <div 
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                    style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <AlertCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1" style={{ transform: "translateZ(25px)" }}>
                      <h4 className="text-base font-bold text-foreground">Clinical Intake Brief Held</h4>
                      <p className="text-xs text-muted-foreground max-w-md">
                        Intake is currently suspended. Pending supervisor clinical signature and GPS routing review.
                      </p>
                    </div>
                    <button
                      onClick={resetSimulation}
                      style={{ transform: "translateZ(15px)" }}
                      className="px-4 py-2 bg-foreground text-background hover:opacity-90 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Simulation
                    </button>
                  </div>
                ) : scanState === 'denied' ? (
                  // Denied state view
                  <div 
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                    style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <X className="w-6 h-6" />
                    </div>
                    <div className="space-y-1" style={{ transform: "translateZ(25px)" }}>
                      <h4 className="text-base font-bold text-foreground">Intake Registration Denied</h4>
                      <p className="text-xs text-muted-foreground max-w-md">
                        The registration request was cancelled. Mapped beds and reserved blood units have been released back to the registry.
                      </p>
                    </div>
                    <button
                      onClick={resetSimulation}
                      style={{ transform: "translateZ(15px)" }}
                      className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Simulation
                    </button>
                  </div>
                ) : (
                  // Idle or Scanned default view
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border p-0"
                    style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                  >
                    {/* Left pane: Details */}
                    <div className="pr-0 md:pr-6 pb-6 md:pb-0 space-y-4" style={{ transform: "translateZ(15px)" }}>
                      <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Clinical Intake Brief</span>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        Symptom Triage & Hospital Bed Proximity Routing Index
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {scanState === 'idle' 
                          ? "Patient coordinates acquired. Mapped ICU capacity systems, local blood stock grids, and PM Jan Aushadhi generic databases are ready for registry scan compile. Click Tap to Scan to begin."
                          : "Patient scanned at New Delhi central zone coordinates. Mapped 8 emergency ICU beds, checked blood registries for O-negative stock, and flagged 2 generic alternatives for immediate dispatch."
                        }
                      </p>
                      <div className="flex gap-2 flex-wrap text-[10px] pt-1">
                        <span className={`px-2 py-0.5 rounded border font-semibold ${
                          scanState === 'idle'
                            ? "border-border bg-muted text-muted-foreground"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          Dispatch: {scanState === 'idle' ? "Awaiting Scan" : "Active"}
                        </span>
                        <span className="px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground font-semibold">
                          Coordinates: 28.6139, 77.2090
                        </span>
                      </div>
                    </div>

                    {/* Right pane: Actions */}
                    <div 
                      className="pl-0 md:pl-6 pt-6 md:pt-0 space-y-4 flex flex-col justify-between"
                      style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}
                    >
                      <div style={{ transform: "translateZ(10px)" }}>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">SUGGESTED ACTIONS</span>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5 text-xs text-foreground">
                            <span className="w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                            <div>
                              <div className="font-bold text-foreground/95">ICU Reservist Index</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {scanState === 'idle' ? "Awaiting scanning validation..." : "Alert AIIMS Emergency Ward regarding bed dispatch."}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs text-foreground">
                            <span className="w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                            <div>
                              <div className="font-bold text-foreground/95">O-Negative Registry Sync</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {scanState === 'idle' ? "Awaiting database compilation..." : "Acquire confirmation from Red Cross Delhi bank."}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 text-[9px] font-bold font-sans" style={{ transform: "translateZ(15px)" }}>
                        <button 
                          type="button" 
                          onClick={() => setScanState('denied')}
                          disabled={scanState === 'idle'}
                          className="px-2.5 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deny
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setScanState('held')}
                          disabled={scanState === 'idle'}
                          className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Hold
                        </button>
                        <button 
                          type="button" 
                          onClick={startExecute}
                          disabled={scanState === 'idle'}
                          className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded transition-colors cursor-pointer disabled:bg-emerald-500/20 disabled:text-emerald-500/60 disabled:cursor-not-allowed shadow-sm"
                        >
                          Approve - Execute
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="py-16 bg-zinc-950 border-b border-zinc-900 scroll-mt-20 flex-grow"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Registry Search Results</h2>
                  <p className="text-xs text-zinc-450">Matches for: <span className="font-semibold text-zinc-200">"{query}"</span></p>
                </div>
                
                <div className="flex gap-1 overflow-x-auto pb-1">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                        selectedResultTab === tab.id
                          ? "bg-white text-black border-white shadow-sm"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {!hasResults ? (
                <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-400 font-semibold">No exact matches found. Try searching simple terms like "cardiac", "O+", or "Crocin".</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Emergency Warning */}
                  {results.emergency && (selectedResultTab === "all" || selectedResultTab === "triage") && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 bg-red-950/20 border border-red-900/60 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                          <ShieldAlert className="w-5 h-5 animate-pulse text-red-500" />
                          CRITICAL: {results.emergency.category} Instructions
                        </div>
                        <p className="text-sm font-semibold text-zinc-300 leading-relaxed">
                          {results.emergency.instructions}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <a 
                          href={`tel:${results.emergency.dispatch.split(" ")[0]}`}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-center rounded-lg shadow-sm text-xs flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-4 h-4" />
                          Call {results.emergency.dispatch}
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Symptom triage advice */}
                  {results.triage && (selectedResultTab === "all" || selectedResultTab === "triage") && (
                    <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                      <h3 className="text-sm font-bold mb-4 border-b border-zinc-800 pb-2.5 flex items-center gap-2 text-white">
                        <Stethoscope className="w-4 h-4 text-zinc-400" />
                        AI Symptoms Assessment
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3.5 rounded-lg border border-amber-950 bg-amber-950/20 text-center flex flex-col justify-center">
                          <span className="text-[9px] font-bold uppercase text-amber-500 mb-0.5">Assessment Severity</span>
                          <span className="text-base font-extrabold text-amber-400">{results.triage.severity}</span>
                        </div>
                        <div className="md:col-span-2 p-3.5 rounded-lg border border-zinc-800 bg-zinc-950">
                          <span className="text-[9px] font-bold uppercase text-zinc-500 block mb-0.5">Suspected Conditions</span>
                          <span className="font-bold text-zinc-200 text-sm">{results.triage.condition}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400">
                        {results.triage.action}
                      </div>
                    </div>
                  )}

                  {/* Hospitals list */}
                  {results.hospitals.length > 0 && (selectedResultTab === "all" || selectedResultTab === "hospitals") && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                        <MapPin className="w-4 h-4 text-zinc-550" />
                        Beds & Emergency Care ({results.hospitals.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.hospitals.slice(0, 4).map((hosp) => (
                          <div key={hosp.id} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 flex flex-col justify-between hover:shadow-sm transition-shadow">
                            <div>
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="text-sm font-bold text-white">{hosp.name}</h4>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded">{hosp.type}</span>
                              </div>
                              <p className="text-xs text-zinc-550 flex items-center gap-1.5 mb-4">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                                {hosp.address}
                              </p>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-zinc-800 text-xs font-semibold text-zinc-400">
                              <span className="text-red-400 font-bold bg-red-950/30 border border-red-900/60 px-2 py-0.5 rounded">Beds: {hosp.beds}</span>
                              <div className="flex gap-1.5">
                                <a href={`tel:${hosp.phone}`} className="px-2.5 py-1.5 border border-zinc-850 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center gap-1">📞 Call</a>
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`} target="_blank" rel="noreferrer" className="px-2.5 py-1.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors">Directions</a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blood stock */}
                  {results.bloodBanks.length > 0 && (selectedResultTab === "all" || selectedResultTab === "blood") && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                        <Droplet className="w-4 h-4 text-red-500" />
                        Blood Bank Stock Inventories ({results.bloodBanks.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.bloodBanks.slice(0, 4).map((bank) => (
                          <div key={bank.id} className="bg-zinc-950 rounded-lg p-5 border border-zinc-900 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-white">{bank.name}</h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">{bank.address}</p>
                              </div>
                              <a href={`tel:${bank.phone}`} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors">📞</a>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-bold">
                              <div className="p-1 rounded bg-red-950/20 border border-red-900/50 text-red-400">A+ ({bank.aPlus}U)</div>
                              <div className="p-1 rounded bg-red-950/20 border border-red-900/50 text-red-400">B+ ({bank.bPlus}U)</div>
                              <div className="p-1 rounded bg-red-950/20 border border-red-900/50 text-red-400">O- ({bank.oMinus}U)</div>
                              <div className="p-1 rounded bg-red-950/20 border border-red-900/50 text-red-400">AB+ ({bank.abPlus}U)</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medicines */}
                  {results.medicines.length > 0 && (selectedResultTab === "all" || selectedResultTab === "medicine") && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                        <Percent className="w-4 h-4 text-zinc-500" />
                        Generic Alternative Substitutes ({results.medicines.length})
                      </h3>
                      <div className="space-y-3">
                        {results.medicines.map((med) => (
                          <div key={med.id} className="bg-zinc-950 rounded-lg p-5 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-white">{med.name} / <span className="text-zinc-400 font-semibold">{med.genericName}</span></h4>
                              <p className="text-xs text-zinc-500 mt-1">{med.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-zinc-500 line-through">Brand: ₹{med.brandPrice}</div>
                              <div className="text-base font-extrabold text-green-500">Generic: ₹{med.genericPrice}</div>
                              <div className="text-[9px] text-green-400 font-bold bg-green-950/20 border border-green-900/50 px-1.5 py-0.5 rounded mt-1">Save ₹{med.savings}</div>
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
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-card/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
              Critical Care Response
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground animate-pulse">
              Speed Dial Emergency SOS Network
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              When seconds count, trigger SwasthAI's coordinated SOS channel. Dispatch local ambulances, locate cardiac arrest support equipment, and alert regional trauma networks automatically.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">12.4 Min</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Average Response Dispatch</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">1,200+</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Verified Responders</div>
              </div>
            </div>
            <a 
              href="/emergency" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Access SOS System <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" 
              alt="Emergency Ambulance Dispatch" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: HOSPITAL FINDER */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800" 
              alt="Modern Hospital and Emergency Ward" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1 bg-muted border border-border rounded-md">
              Real-time Capacity Map
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Hospital Finder & Beds Tracker
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Find verified medical facilities by GPS distance calculations. Monitor live vacant beds, ICU ventilators count, and emergency department statuses across national government grids.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">120+</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Hospitals Connected</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">2,500+</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Live Vacant Beds</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/hospitals" className="px-4 py-2 border border-border hover:bg-muted bg-card text-muted-foreground hover:text-foreground font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">Find Beds</a>
              <a href="/map" className="px-4 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90 cursor-pointer transition-colors flex items-center gap-1">Open Interactive Map</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: BLOOD AVAILABILITY */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
              Donor Stock Logs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Blood Stock Availability Check
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Query the direct live units index of regional blood banks. Select state, city, and specific groups (A+, O-, AB-) to pinpoint active units before traveling.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">130+</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Stocked Blood Banks</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">8 Groups</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">A+, A-, B+, B-, O+, O-, AB+, AB-</div>
              </div>
            </div>
            <a href="/blood-banks" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
              Explore Blood Stocks
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800" 
              alt="Blood Donation and Labs Visual" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: MEDICINE SAVINGS */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" 
              alt="Generic Medicines and Pharmacy Visual" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-500/10 border border-green-500/20 dark:text-green-400 rounded-md px-2.5 py-1">
              Cost Optimization
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Medicine Savings & Generic Finder
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Save up to 80% on clinical prescriptions. Instantly look up expensive branded medicines to find cheap equivalent PM Jan Aushadhi generic alternatives.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-green-500">Up to 80%</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Avg Patient Cost Savings</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-green-500">10,000+</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Generic Substitutes Mapped</div>
              </div>
            </div>
            <a href="/pharmacy" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
              Compare Drug Prices
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: AI TRIAGE */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/20 dark:text-amber-400 rounded-md px-2.5 py-1">
              Symptom Triage Check
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground animate-pulse">
              AI Symptom Analysis Engine
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Describe symptoms in your own words. The triage logic maps keywords to clinical criteria to give warning ratings (High, Medium, Low) and next steps guidance.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-amber-400">100%</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Clinical Logic Mapping</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-amber-400">Instant</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Diagnostic Report Generation</div>
              </div>
            </div>
            <a href="/triage" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
              Launch Symptom Analyzer
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
              alt="AI Doctor Clinical Advisor" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: AI REPORT ANALYZER */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" 
              alt="Medical Report Scanning and Analysis" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1 bg-muted border border-border rounded-md">
              Document Decoder
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AI Medical Report Analyzer
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Upload blood tests, urine screens, or general health panels (PDF/JPEG). AI decodes complex laboratory terminology into plain layperson explanations, flags abnormalities, and suggests specialist consults.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">PDF & JPG</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Multi-Format Extraction Support</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">Decoded</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Simple Language Explanations</div>
              </div>
            </div>
            <a href="/triage" className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background hover:opacity-90 font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
              Analyze Medical Report
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: AI INJURY DETECTION */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
              Vision Detection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AI Injury Detection Scan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Submit images of topical wounds or suspected skeletal impacts. Gemini Vision models identify second-degree burns, cuts, bone fractures, skin infections, bruises, and swelling.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">6 Wound Types</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Burns, Cuts, Fractures, & More</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-red-500">Dual-Arch</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Gemini & GPT-4o Vision Adapters</div>
              </div>
            </div>
            <a href="/injury-detection" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
              Scan Injury Photo
            </a>
          </motion.div>
          
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800" 
              alt="Medical Scan and Injury Diagnostic Visual" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* SECTION 9: HEALTH RISK PREDICTION */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800" 
              alt="Smart Watch Health Monitoring Visual" 
              className="rounded-xl border border-border object-cover w-full h-[260px] shadow-sm hover:opacity-95 transition-opacity"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-5"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1 bg-muted border border-border rounded-md">
              Predictive Diagnostics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Health Risk Prediction Center
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Calculate your overall health risk profile. Collect basic inputs like age, weight, and blood pressure to predict heart disease risk, stroke risk, and diabetes likelihoods.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">3 Profiles</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Heart, Stroke, & Diabetes Indexes</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
                <div className="text-xl font-bold text-foreground">Lifestyle</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Tailored Fitness & Diet Recommendations</div>
              </div>
            </div>
            <a href="/health-risk" className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background hover:opacity-90 font-bold text-xs rounded-lg transition-colors shadow-sm">
              Assess Your Risk Scale
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 10: HEALTHCARE ANALYTICS */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-md">
              India Health Index Data
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              National Health Registries Analytics
            </h2>
            <p className="text-xs text-muted-foreground">
              Live statistics collected dynamically across public and private hospitals.
            </p>
          </div>

          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary counters */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground/80">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  National Coverage
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-border rounded bg-muted">
                    <div className="text-lg font-bold text-foreground">{analytics.coverageSummary.totalStatesCovered}</div>
                    <div className="text-[8px] text-muted-foreground uppercase font-semibold">States Covered</div>
                  </div>
                  <div className="p-3 border border-border rounded bg-muted">
                    <div className="text-lg font-bold text-foreground">{analytics.coverageSummary.totalCitiesCovered}</div>
                    <div className="text-[8px] text-muted-foreground uppercase font-semibold">Major Cities</div>
                  </div>
                  <div className="p-3 border border-border rounded bg-muted">
                    <div className="text-lg font-bold text-foreground">{analytics.coverageSummary.totalHospitals}</div>
                    <div className="text-[8px] text-muted-foreground uppercase font-semibold">Hospitals</div>
                  </div>
                  <div className="p-3 border border-border rounded bg-muted">
                    <div className="text-lg font-bold text-foreground">{analytics.coverageSummary.totalBloodBanks}</div>
                    <div className="text-[8px] text-muted-foreground uppercase font-semibold">Blood Banks</div>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded border border-border text-[10px] leading-relaxed text-muted-foreground">
                  Our system verifies bed queues and ambulance dispatches across a network of <b>{analytics.coverageSummary.emergencyCoverageKm}</b>.
                </div>
              </div>

              {/* Chart 1: State-wise hospitals bed volume */}
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between shadow-sm">
                <h3 className="text-xs font-bold mb-4 text-foreground/80">Top Bed Capacity by States</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stateHospitals}>
                      <XAxis dataKey="state" tick={{ fontSize: 9, fill: "#71717a" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
                      <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '6px', color: 'var(--foreground)' }} />
                      <Bar dataKey="totalBeds" fill="#2563eb" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: State-wise blood donor units */}
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between shadow-sm">
                <h3 className="text-xs font-bold mb-4 text-foreground/80">Top Blood Units by States</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stateBlood}>
                      <XAxis dataKey="state" tick={{ fontSize: 9, fill: "#71717a" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
                      <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '6px', color: 'var(--foreground)' }} />
                      <Bar dataKey="totalUnits" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">Loading live digital health statistics...</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 11: TESTIMONIALS */}
      <section className="py-20 border-b border-border bg-card/40 overflow-hidden relative">
        <div className="space-y-10 w-full">
          <div className="text-center max-w-xl mx-auto space-y-2 px-4 sm:px-6 lg:px-8">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Public Feedback</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Trusted by Patients & Clinicians</h2>
          </div>
          
          <div className="relative flex flex-col gap-6 w-full py-4 group/marquee overflow-hidden">
            {/* Fade Mask Overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

            {/* Row 1 (Right to Left scroll) */}
            <div className="flex select-none overflow-hidden gap-6 animate-marquee-left group-hover/marquee:[animation-play-state:paused]">
              {testimonials.slice(0, 4).map((card) => (
                <TestimonialCard key={card.name} card={card} />
              ))}
              {/* Duplicate cards for loop */}
              {testimonials.slice(0, 4).map((card) => (
                <TestimonialCard key={card.name + "-dup"} card={card} isDup={true} />
              ))}
            </div>

            {/* Row 2 (Left to Right scroll) */}
            <div className="flex select-none overflow-hidden gap-6 animate-marquee-right group-hover/marquee:[animation-play-state:paused]">
              {testimonials.slice(4, 8).map((card) => (
                <TestimonialCard key={card.name} card={card} />
              ))}
              {/* Duplicate cards for loop */}
              {testimonials.slice(4, 8).map((card) => (
                <TestimonialCard key={card.name + "-dup"} card={card} isDup={true} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: FAQ */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Information Check</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "Is SwasthAI completely free to use?", a: "Yes, SwasthAI is a 100% free open-access healthcare directory platform. We do not require account registration or collect subscription fees." },
              { q: "Where does the hospital bed availability data come from?", a: "Bed queues, ICU capacities, and ventilator statistics are synced dynamically with the public India Digital Health Grid registries." },
              { q: "How accurate is the AI Injury and Report Analyzer?", a: "Our AI systems utilize Gemini and GPT-4o Vision models to parse document texts and identify topical lacerations. These assessments are informational and should always be reviewed by medical doctors." },
              { q: "How can I update my facility's blood stocks or beds?", a: "Healthcare administrators can contact our coordination desk via the Contact form to register credentials and update local inventories." }
            ].map((faq, i) => (
              <details key={i} className="p-4 border border-border bg-card rounded-lg group cursor-pointer transition-all">
                <summary className="text-xs font-bold text-foreground flex justify-between items-center select-none">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold mt-3 pt-3 border-t border-border">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13: CONTACT */}
      <section className="py-20 border-b border-border px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Get In Touch</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Contact Coordination Desk</h2>
            <p className="text-xs text-muted-foreground">For integrations, public data inquiries, or hospital registrations.</p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent successfully! Our team will contact you shortly.");
              (e.target as HTMLFormElement).reset();
            }} 
            className="bg-card rounded-lg p-6 border border-border shadow-sm space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-muted-foreground uppercase font-bold text-[9px] mb-1.5">Full Name</label>
              <input type="text" className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 outline-none text-foreground focus:border-muted-foreground" required />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase font-bold text-[9px] mb-1.5">Email Address</label>
              <input type="email" className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 outline-none text-foreground focus:border-muted-foreground" required />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase font-bold text-[9px] mb-1.5">Message / Inquiry</label>
              <textarea rows={4} className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 outline-none text-foreground focus:border-muted-foreground resize-none" required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-foreground text-background font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer">
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

