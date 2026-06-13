import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Percent, Phone, MapPin, Sparkles, Plus, Minus } from "lucide-react";

interface Medicine {
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

interface PharmacyStore {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  lat: number;
  lng: number;
}

export default function Pharmacy() {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyStore[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculator states
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);

      const res = await fetch(`/api/pharmacy/medicines?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
        if (data.length > 0 && !selectedMed) {
          setSelectedMed(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const res = await fetch("/api/pharmacy/stores");
      if (res.ok) {
        const data = await res.json();
        setPharmacies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchPharmacies();
  }, [searchQuery]);

  const calculateSavingsPercent = (brand: number, gen: number) => {
    return Math.round(((brand - gen) / brand) * 100);
  };

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
            className="mb-16 text-left"
          >
            <span className="text-xs font-semibold tracking-wider text-accent uppercase mb-3 block">
              Savings & Subsidies
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 sm:text-5xl">
              {t("pharmacy.title")}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Compare branded medicine prices against affordable government-subsidized Jan Aushadhi generic alternatives and maximize your savings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            
            {/* Search & Listing */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Search Bar */}
              <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3 shadow-2xl focus-within:border-zinc-805 transition-all">
                <Search className="w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={t("pharmacy.search") + " (e.g. Paracetamol, Augmentin, Lipitor...)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-zinc-550 outline-none text-sm"
                />
              </div>

              {/* Medicine List */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-6 h-6 border-2 border-zinc-800 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-zinc-500">Searching medicines...</p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl">
                  <p className="text-sm text-zinc-500 font-medium">No medicines found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicines.map((med) => {
                    const isSelected = selectedMed?.id === med.id;
                    return (
                      <motion.div
                        key={med.id}
                        onClick={() => setSelectedMed(med)}
                        className={`bg-zinc-950 border rounded-lg p-5 cursor-pointer transition-all duration-200 hover:border-zinc-800 shadow-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                          isSelected ? "border-white ring-1 ring-white" : "border-zinc-900"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-white">{med.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-medium border border-zinc-800">
                              {med.category || "General"}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            {t("pharmacy.generic")}: <span className="font-semibold text-zinc-300">{med.genericName}</span>
                          </p>
                          {med.description && (
                            <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xl">{med.description}</p>
                          )}
                        </div>

                        <div className="flex items-start gap-4 justify-between sm:justify-end sm:border-l border-zinc-900 sm:pl-6 pt-2 sm:pt-0">
                          <div className="text-right flex flex-col items-end">
                            <span className="text-xs text-zinc-550 line-through">₹{med.brandPrice.toFixed(2)}</span>
                            <span className="text-lg font-bold text-white">₹{med.genericPrice.toFixed(2)}</span>
                            <span className="text-[10px] font-bold text-green-400 bg-green-950/20 border border-green-900/50 px-1.5 py-0.5 rounded-md mt-1.5 flex items-center gap-0.5">
                              <Percent className="w-2.5 h-2.5" />
                              {calculateSavingsPercent(med.brandPrice, med.genericPrice)}% Save
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Savings Calculator Widget */}
            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl">
                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  Monthly Savings Calculator
                </h3>

                {selectedMed ? (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-0.5">{selectedMed.name}</h4>
                      <p className="text-[11px] text-zinc-500">Equivalent to: {selectedMed.genericName}</p>
                    </div>

                    <div className="flex items-center justify-between border-y border-zinc-900 py-3.5">
                      <span className="text-xs font-medium text-zinc-400">Packs / Month</span>
                      <div className="flex items-center space-x-2 bg-zinc-905 border border-zinc-800 rounded-md p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-semibold text-xs text-white w-6 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Branded price ({quantity}x):</span>
                        <span className="line-through">₹{(selectedMed.brandPrice * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Generic alternative ({quantity}x):</span>
                        <span className="font-medium text-zinc-200">₹{(selectedMed.genericPrice * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                        <span className="text-xs font-bold text-zinc-300">Monthly Savings:</span>
                        <span className="text-xl font-extrabold text-green-400">₹{(selectedMed.savings * quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-green-950/20 border border-green-900/60 text-green-400 rounded-md text-[11px] font-semibold text-center leading-relaxed">
                      Saving equivalent to {calculateSavingsPercent(selectedMed.brandPrice, selectedMed.genericPrice)}% budget reduction!
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-8">Select a medicine to calculate savings.</p>
                )}
              </div>
            </div>
          </div>

          {/* Near Pharmacies List */}
          <div className="border-t border-zinc-900 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Nearby Jan Aushadhi Kendras
            </h2>
            <p className="text-xs text-zinc-400 mb-8 max-w-2xl">
              Locate government-certified health centers and generic stores closest to you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pharmacies.map((store) => (
                <div key={store.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-800 transition-all shadow-2xl">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">{store.name}</h4>
                    <p className="text-xs text-zinc-450 flex items-start gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-zinc-650 mt-0.5 flex-shrink-0" />
                      <span>{store.address}, {store.city}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-900 text-xs text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-zinc-550" />
                    <span>{store.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
