import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Phone, Mail, LogIn, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOnboardingRequired: () => void;
}

export default function LoginModal({ isOpen, onClose, onOnboardingRequired }: LoginModalProps) {
  const { t } = useLanguage();
  const { sendOtp, loginWithPhone, loginWithGoogle, loginWithEmail, loginAsGuest } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"phone" | "email" | "google" | "guest">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sandbox & Google account chooser states
  const [receivedOtp, setReceivedOtp] = useState("");
  const [googleChooserStep, setGoogleChooserStep] = useState<"list" | "custom">("list");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
      setReceivedOtp(result.otp || "");
      setCountdown(60);
      toast.success(`OTP sent successfully! Use code ${result.otp} to verify.`);
    } else {
      toast.error(result.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    const result = await loginWithPhone(phone, otp);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back to SwasthAI!");
      onClose();
      // Wait for session sync, then onboarding check in caller
      onOnboardingRequired();
    } else {
      toast.error(result.error || "Invalid OTP code");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    const result = await loginWithEmail(email, password, isRegistering ? name : undefined);
    setLoading(false);
    if (result.success) {
      toast.success(isRegistering ? "Registration successful!" : "Welcome back!");
      onClose();
      onOnboardingRequired();
    } else {
      toast.error(result.error || "Authentication failed");
    }
  };

  const handleExecuteGoogleLogin = async (email: string, name: string, pic: string) => {
    setGoogleLoading(true);
    // Simulate real network delay for Google OAuth handshake (1.2s)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const result = await loginWithGoogle(email, name, pic);
    setGoogleLoading(false);
    if (result.success) {
      toast.success(`Google Account connected: ${email}`);
      onClose();
      onOnboardingRequired();
    } else {
      toast.error(result.error || "Failed to authenticate with Google");
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    const result = await loginAsGuest();
    setLoading(false);
    if (result.success) {
      toast.info("Accessing in Emergency Guest Mode");
      onClose();
    } else {
      toast.error("Failed to enter guest mode");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl glass border border-white/20 p-6 sm:p-8 shadow-2xl z-10 bg-white/80 dark:bg-slate-900/90 text-foreground"
      >
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("auth.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-foreground/60 mb-6">{t("auth.subtitle")}</p>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-black/5 dark:bg-white/5 mb-6">
          {[
            { id: "phone", label: "Phone", icon: Phone },
            { id: "email", label: "Email", icon: Mail },
            { id: "google", label: "Google", icon: Sparkles },
            { id: "guest", label: "Guest", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setOtpSent(false);
                  setReceivedOtp("");
                  setGoogleChooserStep("list");
                  setGoogleLoading(false);
                }}
                className={`flex flex-col items-center justify-center py-2.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/30 dark:hover:bg-slate-800/30"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content area based on Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                      {t("auth.phone_label")}
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-border bg-white/50 dark:bg-slate-800/50">
                      <span className="flex items-center px-3 text-sm text-foreground/50 border-r border-border bg-black/5 dark:bg-white/5">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 bg-transparent px-3 py-2 text-foreground placeholder-foreground/40 outline-none text-base font-semibold tracking-wider"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {loading ? "Sending..." : t("auth.send_otp")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                      {t("auth.otp_label")} ({phone})
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-widest text-lg font-bold bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-2 outline-none"
                    />
                  </div>

                  {receivedOtp && (
                    <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5 text-left">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Demo Sandbox Environment
                      </div>
                      <p className="text-[11px] text-foreground/70 leading-relaxed">
                        Since this is a local sandbox without a live SMS gateway, a secure OTP code has been generated. Use this code to verify:
                      </p>
                      <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-border mt-1">
                        <span className="font-mono text-sm font-extrabold tracking-wider text-primary ml-1">{receivedOtp}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtp(receivedOtp);
                            toast.success("OTP auto-filled!");
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/95 text-white rounded transition-all cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-foreground/60">
                    <span>Didn't receive OTP?</span>
                    {countdown > 0 ? (
                      <span>Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-primary font-bold hover:underline"
                      >
                        {t("auth.resend")}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying..." : t("auth.verify")}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-foreground/80">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Manvi Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-2 outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground/80">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                <div className="text-right text-xs">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isRegistering ? "Already have an account? Sign In" : "Need an account? Sign Up (Auto-registers)"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? "Authenticating..." : isRegistering ? "Create Account" : "Sign In"}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "google" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-2 text-left"
            >
              {googleLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  {/* Google colored spinner */}
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-red-500 border-b-yellow-500 border-l-green-500 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-foreground/75 animate-pulse">
                    Connecting with Google...
                  </p>
                </div>
              ) : googleChooserStep === "list" ? (
                <div className="space-y-3">
                  <div className="text-center pb-2 border-b border-border/40">
                    <h4 className="font-extrabold text-sm text-foreground/80">Choose an account</h4>
                    <p className="text-xs text-foreground/50">to continue to SwasthAI</p>
                  </div>
                  
                  {/* List of accounts */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {[
                      {
                        name: "Manvi Sharma",
                        email: "manvi.sharma@gmail.com",
                        pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                      },
                      {
                        name: "Rahul Verma",
                        email: "rahul.verma@gmail.com",
                        pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                      },
                      {
                        name: "Demo Account",
                        email: "demo.user@gmail.com",
                        pic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                      }
                    ].map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleExecuteGoogleLogin(acc.email, acc.name, acc.pic)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-white/40 dark:bg-slate-800/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group cursor-pointer"
                      >
                        <img
                          src={acc.pic}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover border border-border"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">
                            {acc.name}
                          </p>
                          <p className="text-xs text-foreground/50 truncate">
                            {acc.email}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setGoogleChooserStep("custom")}
                    className="w-full text-center py-2 text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Use another account
                  </button>

                  <div className="text-[10px] text-foreground/40 text-center leading-relaxed mt-2 pt-2 border-t border-border/40">
                    To continue, Google will share your name, email address, language preference, and profile picture with SwasthAI.
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customGoogleEmail || !customGoogleName) {
                      toast.error("Name and Email are required");
                      return;
                    }
                    if (!customGoogleEmail.includes("@")) {
                      toast.error("Please enter a valid email address");
                      return;
                    }
                    handleExecuteGoogleLogin(
                      customGoogleEmail,
                      customGoogleName,
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    );
                  }}
                  className="space-y-4"
                >
                  <div className="text-center pb-2 border-b border-border/40 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setGoogleChooserStep("list")}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      &larr; Back
                    </button>
                    <span className="text-xs font-bold text-foreground/60">Google Account Setup</span>
                    <span className="w-8" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground/70">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manvi Sharma"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-1.5 outline-none text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground/70">Google Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-border rounded-lg px-3 py-1.5 outline-none text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all border-none"
                  >
                    Verify & Connect Google
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === "guest" && (
            <motion.div
              key="guest"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-4 text-center"
            >
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-start gap-2.5 text-left mb-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Emergency Mode:</span> Access nearby hospitals, pharmacies, and SOS panic triggers immediately without registering. Bookmarks and history will not be saved.
                </div>
              </div>
              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/30 transition-all text-sm"
              >
                {t("auth.emergency")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
