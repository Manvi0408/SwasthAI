import { motion } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Droplet,
  PillBottle,
  Ambulance,
  Brain,
  Zap,
  Globe,
  Mic2,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: AlertTriangle,
    title: "Emergency SOS",
    description: "One-tap emergency activation with instant hospital routing",
    color: "from-red-400 to-red-600",
  },
  {
    icon: MapPin,
    title: "Hospital Discovery",
    description: "AI-powered hospital search with real-time bed availability",
    color: "from-primary to-accent",
  },
  {
    icon: BarChart3,
    title: "Bed Availability",
    description: "Live updates on hospital beds and emergency unit capacity",
    color: "from-emerald-400 to-cyan-600",
  },
  {
    icon: Droplet,
    title: "Blood Bank Search",
    description: "Instant blood type matching and routing to nearest banks",
    color: "from-pink-400 to-red-600",
  },
  {
    icon: Ambulance,
    title: "Ambulance Routing",
    description: "Smart ambulance dispatch with optimal route planning",
    color: "from-orange-400 to-red-600",
  },
  {
    icon: PillBottle,
    title: "Jan Aushadhi Finder",
    description: "Save up to 80% on medicines with generic alternatives",
    color: "from-green-400 to-emerald-600",
  },
  {
    icon: Brain,
    title: "AI Triage Assistant",
    description: "Symptom analysis and emergency severity assessment",
    color: "from-purple-400 to-blue-600",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Entire platform in 10 Indian languages",
    color: "from-blue-400 to-cyan-600",
  },
  {
    icon: Mic2,
    title: "Voice Assistance",
    description: "Hands-free navigation and emergency commands",
    color: "from-indigo-400 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Healthcare Analytics",
    description: "Real-time insights into health emergency patterns",
    color: "from-cyan-400 to-blue-600",
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  index,
}: (typeof features)[0] & { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group glass rounded-xl p-6 hover:shadow-xl transition-all"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>

      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground/70 leading-relaxed">{description}</p>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center space-x-2 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm">Learn more</span>
        <motion.span
          className="text-lg"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </div>
    </motion.div>
  );
};

export default function FeaturesSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comprehensive Healthcare Features
          </h2>
          <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need for emergency healthcare management, powered by
            artificial intelligence and nationwide connectivity.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </motion.div>

        {/* CTA at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
