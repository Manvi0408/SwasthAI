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
    <div className="w-full min-h-screen bg-black text-zinc-100 flex flex-col grid-bg">
      <Navigation />
      <div className="pt-28 pb-16 flex-grow bg-black/60">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              {t("hospitals.title")}
            </h1>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto">
              Find emergency rooms, government trauma facilities, cardiac centers, and general hospital units in real time.
            </p>
          </motion.div>

          {/* Search, Location, & Filters panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 mb-8 space-y-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Search text field */}
              <div className="flex-1 bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 flex items-center space-x-3 focus-within:ring-1 focus-within:ring-zinc-700 focus-within:border-zinc-700">
                <Search className="w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={t("hospitals.search") + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder-zinc-500"
                />
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleAcquireLocation}
                disabled={fetchingLoc}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Crosshair className={`w-3.5 h-3.5 ${fetchingLoc ? "animate-spin" : ""}`} />
                {fetchingLoc ? "Locating..." : userLat ? "Refetch Location" : "Acquire GPS"}
              </button>

            </div>

            {/* Category selection scroll bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedType(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === cat
                      ? "bg-white border-white text-black shadow-sm"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  {cat === "All" ? t("hospitals.filter") : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Grid listings */}
            <div className="lg:col-span-8 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-zinc-800 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-zinc-500">Locating hospitals...</p>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-900">
                  <p className="text-zinc-500 text-sm font-semibold">No hospitals found matching criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.map((bank, index) => (
                    <motion.div
                      key={bank.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-zinc-950 rounded-xl p-5 border border-zinc-900 hover:border-zinc-800 transition-all shadow-xl"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{bank.name}</h3>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                              {bank.type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-650" />
                            {bank.address}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-zinc-300">{bank.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4 pb-4 border-b border-zinc-900">
                        {bank.services.split(", ").map((serv) => (
                          <span
                            key={serv}
                            className="inline-block text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-semibold"
                          >
                            {serv}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-semibold">
                          <span className="text-red-400 font-semibold bg-red-950/20 border border-red-900/60 px-2 py-0.5 rounded">
                            Beds: {bank.beds}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            {bank.phone}
                          </span>
                          {bank.distance && (
                            <span className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                              🗺️ {bank.distance}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-grow sm:flex-initial px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-colors text-xs text-center shadow-sm"
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
            <div className="lg:col-span-4">
              <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-900 h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                <h3 className="text-xs font-bold mb-4 flex items-center gap-1.5 text-zinc-200">
                  <Crosshair className="w-4 h-4 text-accent animate-pulse" />
                  Live Resource Proximity Radar
                </h3>

                {/* Radar Grid Canvas Animation wrapper */}
                <div className="flex-grow rounded-lg border border-zinc-900 bg-black/40 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Radar sweeping animation */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-800/10 to-zinc-800/30 rounded-full animate-[spin_12s_linear_infinite] origin-center w-[280px] h-[280px] m-auto pointer-events-none" />

                  {/* Centered User Indicator */}
                  <div className="w-5 h-5 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                  </div>
                  <span className="absolute text-[9px] text-zinc-500 font-bold mt-8">Your Location</span>

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
                        <MapPin className="w-4 h-4 text-red-500 fill-red-500 group-hover:scale-125 transition-transform" />
                        <span className="text-[8px] bg-zinc-950 text-white px-1.5 py-0.5 border border-zinc-850 rounded shadow mt-1 opacity-90 max-w-[80px] truncate block font-semibold">
                          {h.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[9px] text-zinc-500 mt-4 leading-relaxed font-semibold">
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
