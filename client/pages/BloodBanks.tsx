import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Phone, Droplet, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  
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
      if (user?.id) params.append("userId", user.id);

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
  }, [bloodGroup, city, state, user]);

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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("blood_banks.title")}
            </h1>
            <p className="text-lg text-foreground/60">
              {t("blood_banks.search")}
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground/70">
                {t("blood_banks.blood_group")}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none text-foreground"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg === "All" ? "Select All Types" : bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground/70">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none text-foreground"
              >
                {states.map((st) => (
                  <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground/70">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none text-foreground"
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
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Searching blood stocks...</p>
            </div>
          ) : bloodBanks.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl border border-border/50">
              <Droplet className="w-12 h-12 text-primary/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Blood Banks Found</h3>
              <p className="text-foreground/60 max-w-md mx-auto">
                We couldn't find any blood banks matching your filters. Try selecting a different location or blood group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bloodBanks.map((bank, index) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{bank.name}</h3>
                      <p className="text-sm text-foreground/60 flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
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
                            ? "bg-red-500/10 border-red-500 text-red-500 font-bold"
                            : stock.qty > 0
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-black/5 dark:bg-white/5 border-border text-foreground/30"
                        }`}
                      >
                        <span className="text-xs font-semibold">{stock.type}</span>
                        <span className="text-sm font-bold mt-1">
                          {stock.qty > 0 ? `${stock.qty} U` : "0"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2 text-foreground/70 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{bank.phone}</span>
                    </div>
                    <div className="sm:ml-auto flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all text-center flex items-center gap-1.5"
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
