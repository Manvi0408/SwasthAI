import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, HeartPulse, Shield, MapPin, Camera, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Redirect guests or unauthenticated users
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [activeSection, setActiveSection] = useState<"personal" | "medical" | "emergency" | "location">("personal");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState(user?.profile?.fullName || "");
  const [dob, setDob] = useState(user?.profile?.dob || "");
  const [age, setAge] = useState(user?.profile?.age?.toString() || "");
  const [gender, setGender] = useState(user?.profile?.gender || "Male");
  const [profilePic, setProfilePic] = useState(user?.profile?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");

  const [bloodGroup, setBloodGroup] = useState(user?.medicalInfo?.bloodGroup || "O+");
  const [height, setHeight] = useState(user?.medicalInfo?.height?.toString() || "");
  const [weight, setWeight] = useState(user?.medicalInfo?.weight?.toString() || "");
  const [diseases, setDiseases] = useState(user?.medicalInfo?.diseases || "");
  const [allergies, setAllergies] = useState(user?.medicalInfo?.allergies || "");
  const [medications, setMedications] = useState(user?.medicalInfo?.medications || "");
  const [disability, setDisability] = useState(user?.medicalInfo?.disability || "None");

  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContact?.name || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergencyContact?.phone || "");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(user?.emergencyContact?.relationship || "");

  const [country, setCountry] = useState(user?.locationInfo?.country || "India");
  const [state, setState] = useState(user?.locationInfo?.state || "");
  const [city, setCity] = useState(user?.locationInfo?.city || "");
  const [pincode, setPincode] = useState(user?.locationInfo?.pincode || "");
  const [lat, setLat] = useState<number | null>(user?.locationInfo?.lat || null);
  const [lng, setLng] = useState<number | null>(user?.locationInfo?.lng || null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      fullName, dob, age, gender, profilePic,
      bloodGroup, height, weight, diseases, allergies, medications, disability,
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      country, state, city, pincode, lat, lng,
      language: user?.language,
      theme: user?.theme,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Profile updated successfully!");
      await refreshUser();
    } else {
      toast.error(result.error || "Update failed");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePicChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const base64Url = canvas.toDataURL("image/jpeg", 0.85);
        setProfilePic(base64Url);
        toast.success("Profile photo uploaded successfully!");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRandomAvatar = () => {
    const randomPics = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    ];
    const newPic = randomPics[Math.floor(Math.random() * randomPics.length)];
    setProfilePic(newPic);
    toast.success("AI Avatar selected!");
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          User Settings & Health Card
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings Sidebar Links */}
          <div className="space-y-6">
            
            {/* Visual Photo Card */}
            <div className="glass rounded-2xl p-6 border border-white/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative w-24 h-24 mx-auto mb-3 group">
                <img
                  src={profilePic}
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover border-2 border-primary/50 shadow-md bg-slate-100 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handlePicChange}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex justify-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={handlePicChange}
                  className="text-[10px] px-2 py-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-border rounded-md font-semibold cursor-pointer"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="text-[10px] px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md font-semibold cursor-pointer flex items-center gap-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  AI Pic
                </button>
              </div>
              <h3 className="font-extrabold text-lg text-foreground">{fullName || "User"}</h3>
              <p className="text-xs text-foreground/50">{user?.email || user?.phone}</p>
              <div className="mt-3 px-3 py-1.5 rounded bg-primary/10 text-primary font-bold text-xs inline-block">
                Blood Group: {bloodGroup}
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="glass rounded-2xl p-4 border border-white/20 space-y-1">
              {[
                { id: "personal", label: "Personal Info", icon: UserIcon },
                { id: "medical", label: "Medical Data", icon: HeartPulse },
                { id: "emergency", label: "Emergency Contact", icon: Shield },
                { id: "location", label: "Home Address", icon: MapPin },
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === sec.id
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 font-bold"
                        : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleUpdate} className="glass rounded-2xl p-6 sm:p-8 border border-white/20 space-y-6">
              
              {activeSection === "personal" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b border-border/40 pb-2 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "medical" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b border-border/40 pb-2 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-primary" />
                    Medical Metrics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none"
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Height (cm)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Weight (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Chronic Diseases</label>
                    <input
                      type="text"
                      value={diseases}
                      onChange={(e) => setDiseases(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Current Medications</label>
                      <input
                        type="text"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Disability details</label>
                      <input
                        type="text"
                        value={disability}
                        onChange={(e) => setDisability(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "emergency" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b border-border/40 pb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Emergency Contact Setup
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Contact Person Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Contact Phone Number</label>
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Relationship</label>
                      <input
                        type="text"
                        value={emergencyContactRelationship}
                        onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "location" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b border-border/40 pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Home Location details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground/80">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 border-t border-border/40 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Configuration"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await refreshUser();
                    toast.info("Refreshed profile data");
                  }}
                  className="px-4 py-3 border border-border/40 hover:bg-primary/5 text-foreground/60 rounded-lg text-sm transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Info
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
