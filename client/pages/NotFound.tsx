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
    <div className="w-full">
      <Navigation />
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-b from-background to-background/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl px-4 sm:px-6"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4"
          >
            404
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>

          <p className="text-base sm:text-lg text-foreground/70 mb-8 leading-relaxed">
            We couldn't find the page you're looking for. This page might be
            under development or the route you accessed doesn't exist.
          </p>

          <div className="glass rounded-xl p-8 mb-8">
            <p className="text-sm text-foreground/60 mb-4 font-mono break-all">
              {location.pathname}
            </p>
            <p className="text-sm text-foreground/60">
              If you believe this is an error, please contact our support team.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </motion.button>
            </Link>
            <button className="px-8 py-4 glass text-primary font-bold rounded-lg hover:bg-white/60 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
