import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

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
    <footer className="relative border-t border-zinc-900 bg-black py-12 sm:py-16 text-zinc-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12 pb-12 border-b border-zinc-900">
          
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-black font-black text-sm tracking-tight">
                S
              </div>
              <span className="text-base font-bold text-white tracking-tight">SwasthAI</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              AI-powered emergency healthcare network for India. Live hospital beds, generic pharmacy savings, and rapid responder SOS alerts.
            </p>
          </motion.div>

          {/* Link Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.05 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold text-zinc-200 mb-4 text-[10px] uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      {link.label}
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
          <div className="flex items-center space-x-3 text-xs text-zinc-500 mb-4 sm:mb-0">
            <span>© 2026 SwasthAI. All rights reserved.</span>
            <a 
              href="https://github.com/Manvi0408" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-500">
            <div className="flex items-center space-x-1 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
              <span>🛡️</span>
              <span>NDHM Align</span>
            </div>
            <div className="flex items-center space-x-1 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
              <span>✓</span>
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center space-x-1 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
              <span>🔐</span>
              <span>Data Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
