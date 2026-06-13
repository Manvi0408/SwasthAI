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
    <div className="w-full min-h-screen bg-black text-zinc-100 flex flex-col font-sans grid-bg">
      <Navigation />
      <div className="pt-32 pb-24 flex-grow bg-black/60">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-950/20 border border-red-900/60 rounded-md mb-3">
              Emergency Services
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 flex items-center justify-center gap-2 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-red-650" />
              {t("emergency.title")}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              {t("emergency.description")}
            </p>
          </motion.div>

          {/* SOS Activator Block */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 sm:p-12 shadow-2xl mb-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#991b1b_0%,_transparent_65%)] opacity-20 pointer-events-none" />

            <AnimatePresence mode="wait">
              {!sosActive && !sosTriggered && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Select a category and trigger a rapid emergency alert
                  </p>
                  
                  {/* Category Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setSelectedCategory(cat.label)}
                          className={`p-3 rounded-lg border text-xs font-semibold transition-all duration-205 flex flex-col items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-white border-white text-black shadow-sm"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Trigger Button */}
                  <div className="pt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={startSosCountdown}
                      className="w-40 h-40 rounded-full bg-red-650 hover:bg-red-500 text-white font-extrabold text-lg shadow-[0_4px_20px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center border-4 border-red-950 mx-auto group cursor-pointer transition-colors duration-200"
                    >
                      <Zap className="w-8 h-8 mb-1.5 animate-pulse text-white" />
                      SOS PANIC
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {sosActive && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-8"
                >
                  <h2 className="text-xl font-bold text-red-500 tracking-tight">TRIGGERING EMERGENCY DISPATCH</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Transmitting GPS location details to emergency responders. You can cancel if this was accidental.
                  </p>
                  
                  <div className="text-8xl font-black text-red-500 select-none my-6 font-mono tracking-tighter">
                    {countdown}
                  </div>

                  <button
                    type="button"
                    onClick={cancelSos}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-semibold rounded-md transition-all cursor-pointer"
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
                    <div className="py-16">
                      <div className="w-8 h-8 border-2 border-red-650 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm font-semibold text-zinc-400">Transmitting SOS Coordinates...</p>
                    </div>
                  ) : sosResult ? (
                    <div className="text-left space-y-6">
                      <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-900/60 text-green-400 rounded-lg">
                        <HeartPulse className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs">Emergency Alert Dispatched Successfully</h4>
                          <p className="text-xs text-green-400/90 mt-0.5 leading-relaxed">Location coordinates successfully registered. Responders mapped.</p>
                        </div>
                      </div>

                      {/* Nearest Responder hospital */}
                      <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
                        <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-red-500" />
                          Nearest Emergency Responder
                        </h4>
                        <div className="space-y-3">
                          <p className="font-bold text-white text-lg leading-snug">{sosResult.nearestHospital.name}</p>
                          <p className="text-xs text-zinc-400 leading-relaxed">{sosResult.nearestHospital.address}</p>
                          <div className="flex flex-wrap gap-3 pt-2">
                            <span className="text-[10px] px-2 py-1 rounded bg-red-950/30 text-red-400 border border-red-900/60 font-semibold">
                              Proximity: {sosResult.nearestHospital.distance}
                            </span>
                            <span className="text-[10px] px-2 py-1 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 font-semibold">
                              Response Contact: {sosResult.nearestHospital.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lifesaver instructions */}
                      <div className="p-6 bg-red-950/20 border border-red-900/50 text-zinc-300 rounded-lg">
                        <h4 className="font-bold text-xs text-red-400 mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Immediate First Aid Guidance ({sosResult.category})
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{sosResult.instructions}</p>
                      </div>

                      {/* Reset state */}
                      <div className="text-center pt-4">
                        <button
                          type="button"
                          onClick={() => setSosTriggered(false)}
                          className="px-5 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold rounded-md transition-all cursor-pointer"
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
          <div className="mt-16 border-t border-zinc-900 pt-16">
            <h3 className="text-lg font-bold text-white mb-2">India National Emergency Hotlines</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Instant speed dial options to contact national emergency responders directly.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Ambulance Response", number: "108" },
                { name: "National Hotline", number: "112" },
                { name: "Police Dispatch", number: "100" },
                { name: "Fire Department", number: "101" },
              ].map((dial) => (
                <a
                  key={dial.number}
                  href={`tel:${dial.number}`}
                  className="p-5 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition-all text-center flex flex-col justify-center items-center shadow-2xl"
                >
                  <Phone className="w-4 h-4 mb-2 text-red-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-zinc-550 uppercase tracking-wider mb-1">{dial.name}</span>
                  <span className="text-xl font-bold text-white">{dial.number}</span>
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
