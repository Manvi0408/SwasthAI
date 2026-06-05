import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogIn, LogOut, LayoutDashboard, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Language } from "@/lib/i18n";
import LoginModal from "./LoginModal";

const languageList: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "bn", name: "বাংলা" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.hospitals"), href: "/hospitals" },
    { label: t("nav.blood_banks"), href: "/blood-banks" },
    { label: t("nav.pharmacy"), href: "/pharmacy" },
    { label: t("nav.emergency"), href: "/emergency" },
    { label: t("nav.triage"), href: "/triage" },
    { label: t("nav.about"), href: "/about" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "py-3 sm:py-4 shadow-md bg-white/90 dark:bg-slate-950/90" : "py-4 sm:py-6 bg-white/60 dark:bg-slate-900/60"
        }`}
        style={{
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg group-hover:shadow-primary/50 transition-shadow">
                S
              </div>
              <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SwasthAI
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Language Selector */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase">
                  🌐 {languageList.find((l) => l.code === language)?.name || "Language"}
                </button>
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-border z-50 overflow-hidden">
                  {languageList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors ${
                        language === lang.code ? "text-primary font-bold bg-primary/5" : "text-foreground/70"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </motion.button>

              {/* Auth actions */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center gap-1.5 hover:bg-primary/20 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 rounded-lg border border-border text-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLoginOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all text-sm cursor-pointer"
                >
                  <LogIn className="w-4.5 h-4.5" />
                  {t("nav.login")}
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="xl:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-primary" />
                ) : (
                  <Menu className="w-6 h-6 text-primary" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden overflow-hidden"
          >
            <div className="pt-4 pb-3 space-y-2 border-t border-border mt-4 text-sm font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setLoginOpen(true);
                  }}
                  className="w-full mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {t("nav.login")}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Login Dialog Box */}
      <AnimatePresence>
        {loginOpen && (
          <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            onOnboardingRequired={() => {
              // Redirect to onboarding if authenticated user is new
              setTimeout(() => {
                const storedToken = localStorage.getItem("auth_token");
                if (storedToken) {
                  fetch(`/api/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` }
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.user && !data.user.onboarded && data.user.role !== "GUEST") {
                        navigate("/onboarding");
                      }
                    });
                }
              }, 400);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
