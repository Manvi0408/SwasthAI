import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Activity, Search, ShieldAlert, Sparkles, MapPin, Calendar, Clock, ArrowRight, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    refreshUser().finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Compile timeline from searchHistory, triageHistory, emergencyRequests
  const compileTimeline = () => {
    const timeline: { id: string; type: string; title: string; subtitle: string; time: string; icon: string; color: string }[] = [];

    if (user?.searchHistory) {
      user.searchHistory.forEach((h) => {
        timeline.push({
          id: h.id,
          type: "search",
          title: `Searched in ${h.type.replace("_", " ")}`,
          subtitle: `Query: "${h.query}"${h.filters ? ` | Filters: ${JSON.stringify(JSON.parse(h.filters))}` : ""}`,
          time: h.timestamp,
          icon: "🔍",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        });
      });
    }

    if (user?.triageHistory) {
      user.triageHistory.forEach((tr) => {
        timeline.push({
          id: tr.id,
          type: "triage",
          title: "AI Symptom Assessment",
          subtitle: `Symptoms: "${tr.symptoms}" | Suspected Severity: ${tr.severity}`,
          time: tr.timestamp,
          icon: "🤖",
          color: tr.severity.toLowerCase() === "high" 
            ? "bg-red-500/10 text-red-500 border-red-500/20" 
            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
        });
      });
    }

    if (user?.emergencyRequests) {
      user.emergencyRequests.forEach((req) => {
        timeline.push({
          id: req.id,
          type: "emergency",
          title: `🚨 Emergency SOS Triggered`,
          subtitle: `Category: ${req.category} | Status: ${req.status}`,
          time: req.timestamp,
          icon: "⚠️",
          color: "bg-red-600/15 text-red-600 border-red-600/30",
        });
      });
    }

    // Sort by timestamp desc
    return timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const timelineItems = compileTimeline();

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Welcome Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 rounded-2xl border border-white/20"
        >
          <div className="flex items-center space-x-4 text-center sm:text-left">
            <img
              src={user?.profile?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"}
              alt={user?.profile?.fullName || "User"}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/45 shadow"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Hello, {user?.profile?.fullName || "User"}
              </h1>
              <p className="text-xs sm:text-sm text-foreground/50">
                Member ID: {user?.id}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/profile"
              className="px-4 py-2 border border-border/40 hover:bg-primary/5 rounded-lg text-xs font-bold transition-all"
            >
              Edit Health Card
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Medical Snapshot Card */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="glass rounded-2xl p-6 border border-white/20 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                Emergency Medical Card
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-border/40">
                    <span className="text-xs text-foreground/50 block">Blood Group</span>
                    <span className="text-xl font-black text-primary">{user?.medicalInfo?.bloodGroup || "—"}</span>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-border/40">
                    <span className="text-xs text-foreground/50 block">Age / Gender</span>
                    <span className="text-sm font-black text-foreground">
                      {user?.profile?.age ? `${user.profile.age} Y` : "—"} / {user?.profile?.gender || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-border/40">
                    <span className="text-xs text-foreground/50 block">Height (cm)</span>
                    <span className="text-sm font-black text-foreground">{user?.medicalInfo?.height || "—"}</span>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-border/40">
                    <span className="text-xs text-foreground/50 block">Weight (kg)</span>
                    <span className="text-sm font-black text-foreground">{user?.medicalInfo?.weight || "—"}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-sm border-t border-border/30">
                  <div>
                    <span className="text-xs text-foreground/50 font-semibold block">Allergies:</span>
                    <span className="text-xs font-semibold text-foreground/80">{user?.medicalInfo?.allergies || "None"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-foreground/50 font-semibold block">Diseases:</span>
                    <span className="text-xs font-semibold text-foreground/80">{user?.medicalInfo?.diseases || "None"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-foreground/50 font-semibold block">Medications:</span>
                    <span className="text-xs font-semibold text-foreground/80">{user?.medicalInfo?.medications || "None"}</span>
                  </div>
                </div>

                {/* Emergency Contact */}
                {user?.emergencyContact && (
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-red-500 uppercase block">Emergency Contact</span>
                    <div className="flex justify-between font-bold">
                      <span>{user.emergencyContact.name} ({user.emergencyContact.relationship})</span>
                      <a href={`tel:${user.emergencyContact.phone}`} className="text-primary hover:underline">
                        {user.emergencyContact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Location Card */}
                {user?.locationInfo && (
                  <div className="flex items-center gap-2.5 text-xs text-foreground/60 pt-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Mapped to: {user.locationInfo.city}, {user.locationInfo.state} ({user.locationInfo.pincode})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="glass rounded-2xl p-5 border border-white/20 space-y-3">
              <h3 className="text-sm font-bold text-foreground/80">Quick Health Actions</h3>
              {[
                { label: "Trigger SOS Emergency Dispatch", href: "/emergency", color: "text-red-500 hover:bg-red-500/5 border-red-500/10" },
                { label: "Start AI Symptom Checker Analysis", href: "/triage", color: "text-primary hover:bg-primary/5" },
                { label: "Look up Branded Medicines Savings", href: "/pharmacy", color: "text-green-500 hover:bg-green-500/5" },
              ].map((act) => (
                <Link
                  key={act.label}
                  to={act.href}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    act.color ? act.color : "hover:bg-primary/5"
                  }`}
                >
                  <span>{act.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>

          </div>

          {/* Timeline & Search History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bookmarks summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Saved Hospitals */}
              <div className="glass rounded-2xl p-5 border border-white/20">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  🏥 Saved Hospitals ({user?.savedHospitals?.length || 0})
                </h3>
                <div className="space-y-3">
                  {user?.savedHospitals && user.savedHospitals.length > 0 ? (
                    user.savedHospitals.slice(0, 3).map((h) => (
                      <div key={h.id} className="text-xs space-y-1 py-1.5 border-b border-border/30 last:border-0">
                        <Link to="/hospitals" className="font-bold hover:underline block">{h.name}</Link>
                        <span className="text-foreground/50 block">{h.address}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-foreground/50 py-4">No bookmarked hospitals. <Link to="/hospitals" className="text-primary hover:underline font-bold">Search now</Link></p>
                  )}
                </div>
              </div>

              {/* Saved Medicines */}
              <div className="glass rounded-2xl p-5 border border-white/20">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  💊 Saved Medicines ({user?.savedMedicines?.length || 0})
                </h3>
                <div className="space-y-3">
                  {user?.savedMedicines && user.savedMedicines.length > 0 ? (
                    user.savedMedicines.slice(0, 3).map((m) => (
                      <div key={m.id} className="text-xs py-1.5 border-b border-border/30 last:border-0 flex justify-between items-center">
                        <div>
                          <Link to="/pharmacy" className="font-bold hover:underline block">{m.name}</Link>
                          <span className="text-green-500 font-bold">Saved ₹{m.savings.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-foreground/50 py-4">No saved medicines. <Link to="/pharmacy" className="text-primary hover:underline font-bold">Search now</Link></p>
                  )}
                </div>
              </div>

            </div>

            {/* Timelines history list */}
            <div className="glass rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Your Search & Health History Timeline
              </h3>

              {timelineItems.length === 0 ? (
                <div className="text-center py-16 text-foreground/45">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-foreground/30 animate-pulse" />
                  <h4 className="font-bold">No history available</h4>
                  <p className="text-xs max-w-xs mx-auto mt-1">Your queries, hospital checks, and SOS requests will form a chronological dashboard timeline here.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-border/60 space-y-6">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs">
                        <span className="scale-60">{item.icon}</span>
                      </div>

                      <div className="p-4 rounded-xl border bg-white/40 dark:bg-slate-800/40 space-y-1.5">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                          <span className="text-[10px] font-semibold text-foreground/50 flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.time)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/75 leading-relaxed">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
