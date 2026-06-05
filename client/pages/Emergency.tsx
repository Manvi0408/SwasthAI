import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, Phone, MapPin, HeartPulse, ShieldAlert, Zap } from "lucide-react";
import { toast } from "sonner";

interface SOSResponse {
  requestId: string;
  category: string;
  nearestHospital: {
    name: string;
    address: string;
    phone: string;
    distance: string;
    lat: number;
    lng: number;
  };
  instructions: string;
  dispatchContact: string;
}

export default function Emergency() {
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState("General Emergency");
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosResult, setSosResult] = useState<SOSResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: "Heart Attack", icon: "❤️" },
    { label: "Stroke", icon: "🧠" },
    { label: "Accident / Trauma", icon: "🚗" },
    { label: "Severe Burns", icon: "🔥" },
    { label: "Poisoning", icon: "🧪" },
    { label: "Pregnancy Emergency", icon: "🤰" },
    { label: "Severe Bleeding", icon: "🩸" },
    { label: "Breathing Difficulty", icon: "💨" },
  ];

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (sosActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosActive && countdown === 0) {
      triggerSos();
    }
    return () => clearTimeout(timer);
  }, [sosActive, countdown]);

  const startSosCountdown = () => {
    setSosActive(true);
    setCountdown(5);
    setSosTriggered(false);
    setSosResult(null);
  };

  const cancelSos = () => {
    setSosActive(false);
    setCountdown(5);
    toast.info("SOS Request Cancelled");
  };

  const triggerSos = () => {
    setSosActive(false);
    setSosTriggered(true);
    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported. Dispatched SOS with default coordinates.");
      sendSosRequest(28.5672, 77.2100); // AIIMS New Delhi fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendSosRequest(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error(error);
        toast.warning("Could not acquire exact GPS. Dispatched using approximate location.");
        sendSosRequest(28.5672, 77.2100);
      }
    );
  };

  const sendSosRequest = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          lat,
          lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSosResult(data);
        toast.success("SOS Alert Sent! Emergency response has been initiated.");
      } else {
        toast.error("Server failed to log SOS. Please call 108 immediately!");
      }
    } catch (err) {
      toast.error("Network error. Please dial 108 directly!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold text-red-500 mb-2 flex items-center justify-center gap-2">
              <ShieldAlert className="w-10 h-10 animate-pulse text-red-500" />
              {t("emergency.title")}
            </h1>
            <p className="text-base sm:text-lg text-foreground/60">
              {t("emergency.description")}
            </p>
          </motion.div>

          {/* SOS Activator Block */}
          <div className="glass rounded-3xl p-6 sm:p-10 border border-red-500/20 text-center mb-8 bg-red-500/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              {!sosActive && !sosTriggered && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <p className="text-sm font-semibold text-foreground/70">
                    Select a category and trigger a rapid emergency alert.
                  </p>
                  
                  {/* Category Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setSelectedCategory(cat.label)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1.5 ${
                          selectedCategory === cat.label
                            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                            : "bg-white/40 dark:bg-slate-800/40 border-border text-foreground/70 hover:bg-white/60"
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Main Trigger Button */}
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startSosCountdown}
                      className="w-44 h-44 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xl shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center border-8 border-red-200 dark:border-red-900/60 mx-auto group cursor-pointer"
                    >
                      <Zap className="w-10 h-10 mb-2 animate-bounce group-hover:scale-110 transition-transform" />
                      SOS PANIC
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {sosActive && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-6"
                >
                  <h2 className="text-2xl font-black text-red-500 animate-pulse">TRIGGERING EMERGENCY DISPATCH</h2>
                  <p className="text-sm text-foreground/60 max-w-sm mx-auto">
                    Sending GPS location details to emergency responders. You can cancel if this was accidental.
                  </p>
                  
                  <div className="text-8xl font-black text-red-600 select-none my-6">
                    {countdown}
                  </div>

                  <button
                    type="button"
                    onClick={cancelSos}
                    className="px-8 py-3 bg-foreground text-background font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    Cancel Dispatch
                  </button>
                </motion.div>
              )}

              {sosTriggered && (
                <motion.div
                  key="triggered"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {loading ? (
                    <div className="py-12">
                      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-lg font-bold text-red-500">Transmitting SOS Coordinates...</p>
                    </div>
                  ) : sosResult ? (
                    <div className="text-left space-y-6">
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl">
                        <HeartPulse className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-sm">Emergency Alert Dispatched Successfully</h4>
                          <p className="text-xs">Location coordinates successfully registered. Responders mapped.</p>
                        </div>
                      </div>

                      {/* Nearest Responder hospital */}
                      <div className="p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-border/50">
                        <h4 className="font-bold text-base mb-3 text-foreground/80 flex items-center gap-1.5">
                          <MapPin className="w-5 h-5 text-red-500" />
                          Nearest Emergency Responder
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-bold text-foreground text-lg">{sosResult.nearestHospital.name}</p>
                          <p className="text-foreground/70">{sosResult.nearestHospital.address}</p>
                          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
                            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
                              Proximity: {sosResult.nearestHospital.distance}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                              Response Contact: {sosResult.nearestHospital.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lifesaver instructions */}
                      <div className="p-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl">
                        <h4 className="font-bold text-base mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-5 h-5" />
                          Immediate First Aid Guidance ({sosResult.category})
                        </h4>
                        <p className="text-sm font-semibold leading-relaxed">{sosResult.instructions}</p>
                      </div>

                      {/* Reset state */}
                      <div className="text-center pt-4">
                        <button
                          type="button"
                          onClick={() => setSosTriggered(false)}
                          className="px-6 py-2.5 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-foreground text-xs font-bold rounded-lg transition-all"
                        >
                          Clear SOS Screen / Trigger New Alert
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Speed Dial Contacts */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">India National Emergency Hotlines</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Ambulance Response", number: "108", color: "from-red-500 to-orange-500" },
                { name: "National Hotline", number: "112", color: "from-blue-600 to-indigo-600" },
                { name: "Police Dispatch", number: "100", color: "from-slate-700 to-slate-900" },
                { name: "Fire Department", number: "101", color: "from-amber-600 to-red-600" },
              ].map((dial) => (
                <a
                  key={dial.number}
                  href={`tel:${dial.number}`}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${dial.color} text-white shadow-md hover:shadow-lg hover:scale-102 transition-all text-center flex flex-col justify-center items-center`}
                >
                  <Phone className="w-5 h-5 mb-1.5 animate-pulse" />
                  <span className="text-xs font-medium text-white/80">{dial.name}</span>
                  <span className="text-xl font-black">{dial.number}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
