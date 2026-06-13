import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-black text-zinc-100 flex flex-col font-sans grid-bg">
      <Navigation />
      <div className="flex-grow flex items-center justify-center pt-32 pb-24 bg-black/60">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-xl px-6"
        >
          <div className="text-6xl font-black text-white mb-4 tracking-tighter">
            404
          </div>

          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Page Not Found
          </h1>

          <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
            We couldn't find the page you're looking for. This page might be
            under development or the route you accessed doesn't exist.
          </p>

          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 mb-8 text-left shadow-2xl">
            <p className="text-[11px] text-zinc-500 font-mono break-all mb-3 select-all bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
              Path: {location.pathname}
            </p>
            <p className="text-xs text-zinc-405 leading-normal font-medium">
              If you believe this is an error, please let us know or return to the dashboard.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 justify-center text-xs font-semibold"
          >
            <Link to="/">
              <button
                className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            <button className="px-6 py-2.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto transition-colors cursor-pointer">
              Contact Support
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
