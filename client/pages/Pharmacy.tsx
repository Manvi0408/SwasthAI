import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Percent, Bookmark, BookmarkCheck, Phone, MapPin, Sparkles, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

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
  const { user, saveMedicine, unsaveMedicine } = useAuth();

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
      if (user?.id) params.append("userId", user.id);

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
  }, [searchQuery, user]);

  const isSaved = (medId: string) => {
    return user?.savedMedicines?.some((m) => m.medicineId === medId);
  };

  const handleToggleSave = async (med: Medicine) => {
    if (!user || user.role === "GUEST") {
      toast.error("Please login to save medicines");
      return;
    }

    if (isSaved(med.id)) {
      const res = await unsaveMedicine(med.id);
      if (res.success) toast.success("Removed from saved medicines");
    } else {
      const res = await saveMedicine({
        medicineId: med.id,
        name: med.name,
        brandPrice: med.brandPrice,
        genericPrice: med.genericPrice,
        savings: med.savings,
        availability: med.availability,
      });
      if (res.success) toast.success("Added to saved medicines");
    }
  };

  const calculateSavingsPercent = (brand: number, gen: number) => {
    return Math.round(((brand - gen) / brand) * 100);
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("pharmacy.title")}
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Compare branded medicine prices against affordable government-subsidized Jan Aushadhi generic alternatives and maximize your monthly savings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Search & Listing */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Search Bar */}
              <div className="glass rounded-xl p-4 flex items-center space-x-4">
                <Search className="w-5 h-5 text-primary" />
                <input
                  type="text"
                  placeholder={t("pharmacy.search") + " (e.g. Paracetamol, Augmentin, Lipitor...)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder-foreground/50 outline-none text-base sm:text-lg"
                />
              </div>

              {/* Medicine List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground/60">Searching medicines...</p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="text-center py-12 glass rounded-xl border border-border/50">
                  <p className="text-foreground/50">No medicines found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicines.map((med) => (
                    <motion.div
                      key={med.id}
                      onClick={() => setSelectedMed(med)}
                      className={`glass rounded-xl p-5 border cursor-pointer hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        selectedMed?.id === med.id ? "border-primary/80 ring-1 ring-primary/50" : "border-white/10"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{med.name}</h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            {med.category || "General"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/60">
                          {t("pharmacy.generic")}: <span className="font-semibold text-foreground/80">{med.genericName}</span>
                        </p>
                        <p className="text-xs text-foreground/50 mt-1 max-w-lg">{med.description}</p>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end sm:border-l border-border/40 sm:pl-6">
                        <div className="text-right">
                          <div className="text-sm text-foreground/50 line-through">₹{med.brandPrice.toFixed(2)}</div>
                          <div className="text-xl font-extrabold text-green-500">₹{med.genericPrice.toFixed(2)}</div>
                          <div className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded mt-1 flex items-center gap-0.5">
                            <Percent className="w-3 h-3" />
                            {calculateSavingsPercent(med.brandPrice, med.genericPrice)}% Save
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSave(med);
                            }}
                            className="p-2.5 rounded-lg border border-border/40 hover:bg-primary/5 transition-all text-primary"
                          >
                            {isSaved(med.id) ? (
                              <BookmarkCheck className="w-5 h-5 fill-primary text-primary" />
                            ) : (
                              <Bookmark className="w-5 h-5 text-primary" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Savings Calculator Widget */}
            <div className="space-y-6">
              
              <div className="glass rounded-2xl p-6 border border-white/20 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Monthly Savings Calculator
                </h3>

                {selectedMed ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-bold text-foreground">{selectedMed.name}</h4>
                      <p className="text-xs text-foreground/60">Calculating for: {selectedMed.genericName}</p>
                    </div>

                    <div className="flex items-center justify-between border-y border-border/40 py-4">
                      <span className="text-sm font-semibold text-foreground/70">Packs / Month</span>
                      <div className="flex items-center space-x-3 bg-black/5 dark:bg-white/5 rounded-lg p-1.5">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-8 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Branded Price:</span>
                        <span className="font-semibold line-through">₹{(selectedMed.brandPrice * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Generic alternative:</span>
                        <span className="font-bold text-primary">₹{(selectedMed.genericPrice * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border/30">
                        <span className="font-bold text-foreground">Total Savings:</span>
                        <span className="text-2xl font-black text-green-500">₹{(selectedMed.savings * quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-semibold text-center">
                      Saving equivalent to {calculateSavingsPercent(selectedMed.brandPrice, selectedMed.genericPrice)}% budget cut!
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/50 text-center py-10">Select a medicine to calculate savings.</p>
                )}
              </div>

              {/* Saved Medicines Dashboard List */}
              {user && !user.role.startsWith("GUEST") && user.savedMedicines && user.savedMedicines.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <h3 className="text-base font-bold mb-4">Saved Medicines</h3>
                  <div className="space-y-3">
                    {user.savedMedicines.map((m) => (
                      <div key={m.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0">
                        <div>
                          <div className="text-sm font-bold">{m.name}</div>
                          <div className="text-xs text-green-500">Saved ₹{m.savings.toFixed(2)} / pack</div>
                        </div>
                        <button
                          onClick={() => handleToggleSave({ id: m.medicineId } as any)}
                          className="text-xs text-red-500 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Near Pharmacies List */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Nearby Jan Aushadhi Kendras & Pharmacies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pharmacies.map((store) => (
                <div key={store.id} className="glass rounded-xl p-5 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{store.name}</h4>
                    <p className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {store.address}, {store.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40 text-xs text-foreground/70">
                    <Phone className="w-3.5 h-3.5" />
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
