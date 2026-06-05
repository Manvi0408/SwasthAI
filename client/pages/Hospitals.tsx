import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Phone, Star, Crosshair } from "lucide-react";
import { toast } from "sonner";

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

export default function Hospitals() {
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Location states
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  const categories = ["All", "AIIMS", "Government", "Private", "Trauma Center", "Cardiac Center", "Emergency Center"];

  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }
    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setFetchingLoc(false);
        toast.success("Location acquired. Re-sorting hospitals by proximity.");
      },
      (error) => {
        setFetchingLoc(false);
        toast.error("Failed to fetch current location. Check browser settings.");
      }
    );
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("query", searchTerm);
      if (selectedType !== "All") params.append("type", selectedType);
      if (userLat) params.append("lat", String(userLat));
      if (userLng) params.append("lng", String(userLng));

      const res = await fetch(`/api/hospitals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [searchTerm, selectedType, userLat, userLng]);

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              {t("hospitals.title")}
            </h1>
            <p className="text-lg text-foreground/60 max-w-xl mx-auto">
              Find emergency rooms, government trauma facilities, cardiac centers, and general hospital units in real time.
            </p>
          </motion.div>

          {/* Search, Location, & Filters panel */}
          <div className="glass rounded-2xl p-5 mb-8 space-y-4 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search text field */}
              <div className="flex-1 bg-white/40 dark:bg-slate-800/40 rounded-xl px-4 py-3 border border-border/40 flex items-center space-x-3">
                <Search className="w-5 h-5 text-primary" />
                <input
                  type="text"
                  placeholder={t("hospitals.search") + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground text-sm sm:text-base placeholder-foreground/50"
                />
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleAcquireLocation}
                disabled={fetchingLoc}
                className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crosshair className={`w-4 h-4 ${fetchingLoc ? "animate-spin" : ""}`} />
                {fetchingLoc ? "Locating..." : userLat ? "Refetch Location" : "Acquire GPS"}
              </button>

            </div>

            {/* Category selection scroll bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedType(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                    selectedType === cat
                      ? "bg-gradient-to-r from-primary to-accent border-primary text-white shadow shadow-primary/20"
                      : "bg-white/40 dark:bg-slate-800/40 border-border/40 text-foreground/75 hover:bg-white/60"
                  }`}
                >
                  {cat === "All" ? t("hospitals.filter") : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Grid listings */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground/60">Locating hospitals...</p>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl border border-border/50">
                  <p className="text-foreground/50 text-base font-bold">No hospitals found matching criteria.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {hospitals.map((bank, index) => (
                    <motion.div
                      key={bank.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass rounded-2xl p-6 border border-white/10 hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-foreground">{bank.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {bank.type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/60 flex items-center gap-1.5 mt-1.5">
                            <MapPin className="w-4 h-4 text-primary" />
                            {bank.address}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-foreground">{bank.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border/40">
                        {bank.services.split(", ").map((serv) => (
                          <span
                            key={serv}
                            className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 font-semibold"
                          >
                            {serv}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4 text-xs text-foreground/60 font-semibold">
                          <span className="text-red-500 font-bold bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded">
                            Beds: {bank.beds}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {bank.phone}
                          </span>
                          {bank.distance && (
                            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                              🗺️ {bank.distance}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-grow sm:flex-initial px-6 py-2 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg transition-all text-xs text-center"
                          >
                            {t("hospitals.directions")}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Visual Map Layout */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border border-white/20 h-[500px] flex flex-col relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
                <h3 className="text-base font-bold mb-4 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-primary animate-pulse" />
                  Live Resource Proximity Radar
                </h3>

                {/* Radar Grid Canvas Animation wrapper */}
                <div className="flex-grow rounded-xl border border-border/50 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,150,255,0.07)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,150,255,0.07)_1px,_transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Radar sweeping animation */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-primary/10 rounded-full animate-[spin_10s_linear_infinite] origin-center w-[300px] h-[300px] m-auto pointer-events-none" />

                  {/* Centered User Indicator */}
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                  </div>
                  <span className="absolute text-[10px] text-primary/80 font-bold mt-8">Your GPS Coordinates</span>

                  {/* Hospital Markers flags placement */}
                  {hospitals.slice(0, 4).map((h, i) => {
                    const offsets = [
                      { top: "25%", left: "30%" },
                      { top: "60%", left: "75%" },
                      { top: "15%", left: "70%" },
                      { top: "75%", left: "20%" },
                    ];
                    return (
                      <div
                        key={h.id}
                        className="absolute text-center flex flex-col items-center group cursor-pointer"
                        style={offsets[i % offsets.length]}
                      >
                        <MapPin className="w-5 h-5 text-red-500 fill-red-500 group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] bg-slate-950/80 text-white border border-white/10 px-1 py-0.5 rounded shadow mt-1 opacity-80 max-w-[80px] truncate block">
                          {h.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-foreground/50 mt-4 leading-relaxed">
                  Map representation features simulated GPS proximity indices based on the India digital health grid registry.
                </p>
              </div>
            </div>

          </div>

        </section>
      </div>
      <Footer />
    </div>
  );
}
