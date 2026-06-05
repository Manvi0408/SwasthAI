import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Stat {
  number: number;
  suffix: string;
  label: string;
  icon: string;
}

const stats: Stat[] = [
  { number: 10, suffix: "M+", label: "Citizens Supported", icon: "👥" },
  { number: 5000, suffix: "+", label: "Hospitals Connected", icon: "🏥" },
  { number: 15000, suffix: "+", label: "Blood Banks", icon: "🩸" },
  { number: 100000, suffix: "+", label: "Medicine Listings", icon: "💊" },
  { number: 99.9, suffix: "%", label: "Platform Availability", icon: "⚡" },
];

interface CounterProps extends Stat {
  index: number;
}

const Counter = ({
  number: target,
  suffix,
  label,
  icon,
  index,
}: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const increment = target / 50;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="glass rounded-xl p-6 sm:p-8 text-center hover:shadow-lg transition-all group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="text-4xl sm:text-5xl mb-3"
      >
        {icon}
      </motion.div>

      <motion.div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}
        {suffix}
      </motion.div>

      <p className="text-foreground/70 font-semibold text-sm sm:text-base">
        {label}
      </p>

      {/* Animated bar underneath */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
        viewport={{ once: true }}
        className="mt-4 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
      />
    </motion.div>
  );
};

export default function StatisticsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />

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
            Trusted by Millions
          </h2>
          <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
            SwasthAI is transforming emergency healthcare across India with
            cutting-edge AI technology and nationwide connectivity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4"
        >
          {stats.map((stat, index) => (
            <Counter
              key={stat.label}
              {...stat}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
