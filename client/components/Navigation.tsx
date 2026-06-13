import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Sun, Moon, Home, Map, Stethoscope, 
  Droplet, Pill, Activity, Heart, Scan, AlertTriangle, Info
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
          isScrolled 
            ? "py-3.5 border-border bg-background/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)]" 
            : "py-4 border-transparent bg-transparent"
        }`}
        style={{
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center font-black text-sm tracking-tight transition-all hover:opacity-90">
                S
              </div>
              <span className="hidden sm:inline text-sm font-bold text-foreground tracking-tight">
                SwasthAI
              </span>
            </Link>

            {/* Right Actions (Only Theme Toggle and Menu Hamburger Button) */}
            <div className="flex items-center space-x-2.5">
              
              {/* Theme Toggle Button */}
              {mounted && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Toggle Theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-3.5 h-3.5" />
                  ) : (
                    <Moon className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              )}

              {/* Hamburger Menu Trigger ("side 3 bars" features bar) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Menu"
              >
                {isOpen ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Menu className="w-3.5 h-3.5" />
                )}
              </motion.button>

            </div>
          </div>
        </div>

        {/* Menu Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden bg-background border-b border-border shadow-2xl dark:shadow-black/60"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                  
                  {/* Category 1: Services */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 px-3">
                      Directory & Services
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Home className="w-4 h-4 text-foreground/75" />
                        <span>Home Dashboard</span>
                      </Link>
                      <Link
                        to="/map"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Map className="w-4 h-4 text-foreground/75" />
                        <span>Interactive Proximity Map</span>
                      </Link>
                      <Link
                        to="/hospitals"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Stethoscope className="w-4 h-4 text-foreground/75" />
                        <span>Hospital Bed Registry</span>
                      </Link>
                      <Link
                        to="/blood-banks"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Droplet className="w-4 h-4 text-foreground/75" />
                        <span>Blood Bank Stock</span>
                      </Link>
                      <Link
                        to="/pharmacy"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Pill className="w-4 h-4 text-foreground/75" />
                        <span>Generic Medicine Savings</span>
                      </Link>
                    </div>
                  </div>

                  {/* Category 2: AI Tools */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 px-3">
                      AI & Health Analytics
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/triage"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Activity className="w-4 h-4 text-foreground/75" />
                        <span>AI Symptom Triage</span>
                      </Link>
                      <Link
                        to="/health-risk"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Heart className="w-4 h-4 text-foreground/75" />
                        <span>Vitals Risk Calculator</span>
                      </Link>
                      <Link
                        to="/injury-detection"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Scan className="w-4 h-4 text-foreground/75" />
                        <span>Wound & Injury Scanner</span>
                      </Link>
                    </div>
                  </div>

                  {/* Category 3: Crisis & Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 px-3">
                      Emergency & Platform
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/emergency"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-500/10 dark:bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/10 transition-all cursor-pointer font-bold"
                        onClick={() => setIsOpen(false)}
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                        <span>SOS EMERGENCY PANIC</span>
                      </Link>
                      <Link
                        to="/about"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        <Info className="w-4 h-4 text-foreground/75" />
                        <span>About SwasthAI Grid</span>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
