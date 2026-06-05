import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Emergency Network",
    links: [
      { label: "Search Hospitals", href: "/hospitals" },
      { label: "Blood Banks Stock", href: "/blood-banks" },
      { label: "Generic Pharmacy", href: "/pharmacy" },
      { label: "SOS Panic Button", href: "/emergency" },
    ],
  },
  {
    title: "AI Services",
    links: [
      { label: "AI Symptom Triage", href: "/triage" },
      { label: "Ambulance Routing", href: "/emergency" },
      { label: "Health Calculator", href: "/pharmacy" },
    ],
  },
  {
    title: "About SwasthAI",
    links: [
      { label: "Our Story & Vision", href: "/about" },
      { label: "Impact Metrics", href: "/about" },
      { label: "Contact Support", href: "/about" },
    ],
  },
  {
    title: "Legal Policies",
    links: [
      { label: "Privacy Policy", href: "/about" },
      { label: "Terms of Service", href: "/about" },
      { label: "Compliance & Safety", href: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12 pb-12 border-b border-border/50">
          
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold gradient-text">SwasthAI</span>
            </div>
            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
              AI-powered emergency healthcare network for India. Live hospital beds, generic pharmacy savings, and rapid responder SOS alerts.
            </p>
          </motion.div>

          {/* Link Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/60 hover:text-primary transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between"
        >
          <div className="flex items-center space-x-2 text-sm text-foreground/60 mb-4 sm:mb-0">
            <span>© 2026 SwasthAI. All rights reserved.</span>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              <span>for India's emergency care</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center space-x-6 text-xs text-foreground/60">
            <div className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>NDHM Align</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>✓</span>
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔐</span>
              <span>Data Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
