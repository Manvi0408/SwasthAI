import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Droplet } from "lucide-react";

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

export default function BloodBanks() {
  const { t } = useLanguage();
  
  const [bloodGroup, setBloodGroup] = useState("All");
  const [city, setCity] = useState("All");
  const [state, setState] = useState("All");
  
  const [bloodBanks, setBloodBanks] = useState<BloodBankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const cities = ["All", "New Delhi", "Mumbai", "Chennai", "Bangalore", "Kolkata"];
  const states = ["All", "Delhi", "Maharashtra", "Tamil Nadu", "Karnataka", "West Bengal"];

  const fetchBloodBanks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city !== "All") params.append("city", city);
      if (state !== "All") params.append("state", state);
      if (bloodGroup !== "All") params.append("bloodGroup", bloodGroup);

      const res = await fetch(`/api/blood-banks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBloodBanks(data);
      }
    } catch (err) {
      console.error("Error fetching blood banks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, [bloodGroup, city, state]);

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
              {t("blood_banks.title")}
            </h1>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto">
              {t("blood_banks.search")}
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-2xl"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">
                {t("blood_banks.blood_group")}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white text-xs font-semibold focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg === "All" ? "Select All Types" : bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white text-xs font-semibold focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700"
              >
                {states.map((st) => (
                  <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white text-xs font-semibold focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700"
              >
                {cities.map((ct) => (
                  <option key={ct} value={ct}>{ct === "All" ? "All Cities" : ct}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Blood Banks Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-500">Searching blood stocks...</p>
            </div>
          ) : bloodBanks.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-xl">
              <Droplet className="w-10 h-10 text-zinc-650 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-300 mb-1">No Blood Banks Found</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                We couldn't find any blood banks matching your filters. Try selecting a different location or blood group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bloodBanks.map((bank, index) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-zinc-950 rounded-xl p-5 border border-zinc-900 hover:border-zinc-800 transition-all shadow-2xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                      <h3 className="text-base font-bold text-white mb-1">{bank.name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-650" />
                        {bank.address}
                      </p>
                    </div>
                  </div>

                  {/* Stock Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                    {[
                      { type: "A+", qty: bank.aPlus },
                      { type: "A-", qty: bank.aMinus },
                      { type: "B+", qty: bank.bPlus },
                      { type: "B-", qty: bank.bMinus },
                      { type: "O+", qty: bank.oPlus },
                      { type: "O-", qty: bank.oMinus },
                      { type: "AB+", qty: bank.abPlus },
                      { type: "AB-", qty: bank.abMinus },
                    ].map((stock) => (
                      <div
                        key={stock.type}
                        className={`flex flex-col items-center py-2 rounded-lg border text-center ${
                          bloodGroup === stock.type
                            ? "bg-red-950/40 border-red-900/60 text-red-400 font-bold animate-pulse"
                            : stock.qty > 0
                            ? "bg-zinc-900 border-zinc-800 text-zinc-200 font-semibold"
                            : "bg-zinc-900/20 border-zinc-950 text-zinc-600"
                        }`}
                      >
                        <span className="text-[10px] font-semibold">{stock.type}</span>
                        <span className="text-xs font-bold mt-1">
                          {stock.qty > 0 ? `${stock.qty} U` : "0"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-900">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                      <Phone className="w-3.5 h-3.5 text-zinc-550" />
                      <span>{bank.phone}</span>
                    </div>
                    <div className="sm:ml-auto flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors text-center flex items-center gap-1.5 shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
