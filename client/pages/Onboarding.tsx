import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, HeartPulse, Shield, MapPin, CheckCircle, Navigation, Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const { t } = useLanguage();
  const { user, onboard } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.profile?.fullName || "");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [profilePic, setProfilePic] = useState(user?.profile?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [bloodGroup, setBloodGroup] = useState("O+");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [diseases, setDiseases] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [disability, setDisability] = useState("None");

  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");

  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setFetchingLoc(false);
        toast.success(`Coordinates acquired: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        setFetchingLoc(false);
        toast.error("Failed to acquire GPS location. Please input state/city manually.");
      }
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName) {
        toast.error("Please enter your full name");
        return;
      }
    }
    if (step === 2) {
      if (!bloodGroup) {
        toast.error("Please select a blood group");
        return;
      }
    }
    if (step === 3) {
      if (!emergencyContactName || !emergencyContactPhone || !emergencyContactRelationship) {
        toast.error("Please fill all emergency contact information");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !city || !pincode) {
      toast.error("Please fill all location details");
      return;
    }

    setLoading(true);
    const result = await onboard({
      fullName, dob, age, gender, profilePic,
      bloodGroup, height, weight, diseases, allergies, medications, disability,
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      country, state, city, pincode, lat, lng
    });
    setLoading(false);

    if (result.success) {
      toast.success("Onboarding completed successfully!");
      navigate("/");
    } else {
      toast.error(result.error || "Onboarding failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl glass border border-white/20 p-6 sm:p-10 shadow-2xl bg-white/70 dark:bg-slate-900/80 relative"
      >
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
          {[
            { id: 1, label: "Personal", icon: User },
            { id: 2, label: "Medical", icon: HeartPulse },
            { id: 3, label: "Emergency", icon: Shield },
            { id: 4, label: "Location", icon: MapPin },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex flex-col items-center flex-1 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${
                    step >= s.id
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"
                      : "bg-black/5 dark:bg-white/5 text-foreground/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    step >= s.id ? "text-primary font-bold" : "text-foreground/40"
                  }`}
                >
                  {s.label}
                </span>
                {s.id < 4 && (
                  <div
                    className={`absolute top-5 left-[50%] right-[-50%] h-0.5 -z-0 ${
                      step > s.id ? "bg-gradient-to-r from-primary to-accent" : "bg-black/5 dark:bg-white/5"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Screens */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">Personal Information</h3>
                
                {/* Profile Photo Uploader */}
                <div className="flex flex-col items-center justify-center space-y-3 pb-4 border-b border-border/40">
                  <div className="relative w-24 h-24 group">
                    <img
                      src={profilePic}
                      alt="Profile Preview"
                      className="w-full h-full rounded-full object-cover border-2 border-primary/50 shadow-md bg-slate-100 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground/75 font-semibold cursor-pointer"
                    >
                      Upload Picture
                    </button>
                    <button
                      type="button"
                      onClick={handleRandomAvatar}
                      className="text-xs px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      AI Avatar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manvi Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
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
                      placeholder="Age"
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
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2.5 outline-none text-foreground"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">Medical Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Blood Group *</label>
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
                      placeholder="e.g. 170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 65"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">Existing Chronic Diseases</label>
                  <input
                    type="text"
                    placeholder="e.g. Diabetes, Hypertension, none"
                    value={diseases}
                    onChange={(e) => setDiseases(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, none"
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
                      placeholder="e.g. Metformin 500mg, none"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Disability Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Visually impaired, None"
                      value={disability}
                      onChange={(e) => setDisability(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">Emergency Contacts</h3>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Relationship *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Father, Spouse, Sister"
                      value={emergencyContactRelationship}
                      onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">Location Information</h3>
                
                {/* Geolocation Button */}
                <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                  <div className="flex items-center space-x-3 text-left">
                    <Navigation className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="font-bold text-sm">GPS Geolocation</h4>
                      <p className="text-xs text-foreground/60">Capture location to map nearby hospitals.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={fetchingLoc}
                    onClick={handleGetLocation}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    {fetchingLoc ? "Locating..." : lat ? "Acquired" : "Fetch Location"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 110029"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex gap-4 pt-6 border-t border-border/50">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2.5 border-2 border-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-all text-sm"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? "Completing Profile..." : "Complete Setup"}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
