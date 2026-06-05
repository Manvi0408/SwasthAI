import { motion } from "framer-motion";
import HeroSphere from "./HeroSphere";
import { Heart, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <section className="relative min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* Left Content */}
          <motion.div className="space-y-6 sm:space-y-8">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <div className="glass px-4 py-2 rounded-full flex items-center space-x-2">
                <Heart className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI-Powered Healthcare
                </span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                <span className="gradient-text">SwasthAI</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground/80">
                AI-Powered Emergency Healthcare Network
              </h2>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-lg"
            >
              Find hospitals, blood banks, medicines, emergency care, and life-saving assistance in real time. Nationwide healthcare connectivity powered by advanced AI triage and emergency readiness.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 text-sm text-foreground/60"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                <span>Emergency readiness</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                <span>99.9% availability</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {/* Primary Button */}
              <Link to="/emergency" className="inline-block w-full sm:w-auto">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="group w-full px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Get Emergency Help</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </motion.button>
              </Link>

              {/* Secondary Button */}
              <Link to="/hospitals" className="inline-block w-full sm:w-auto">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full px-8 py-4 glass text-primary font-bold rounded-lg hover:bg-white/60 transition-all text-center"
                >
                  Explore Platform
                </motion.button>
              </Link>

              {/* Tertiary Button - Mobile hidden by default */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="hidden sm:flex px-8 py-4 border-2 border-primary/30 text-primary font-bold rounded-lg hover:border-primary hover:bg-primary/5 transition-all items-center justify-center"
              >
                Login
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Sphere */}
          <motion.div
            variants={itemVariants}
            className="relative h-96 sm:h-[500px] md:h-[600px]"
          >
            <HeroSphere />

            {/* Floating elements around sphere */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-4 right-4 glass px-4 py-2 rounded-lg text-sm font-semibold text-primary backdrop-blur-lg"
            >
              ⚡ Emergency Ready
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-4 left-4 glass px-4 py-2 rounded-lg text-sm font-semibold text-accent backdrop-blur-lg"
            >
              🏥 5000+ Hospitals
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
        >
          <span className="text-sm text-foreground/60 font-semibold">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
