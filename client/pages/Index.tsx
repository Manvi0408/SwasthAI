import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatisticsSection from "@/components/StatisticsSection";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, ShieldAlert, Heart, Activity, MapPin, Pill, Star, Plus, Minus, ArrowRight } from "lucide-react";

export default function Index() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <Navigation />
      <HeroSection />
      
      {/* Metrics/Emergency Response Section */}
      <EmergencyResponseSection />

      {/* Services Grid Previews (Discovery, Blood, Pharmacy, Triage) */}
      <ServicesPreviewSection />

      {/* Features & Stats (Vibrancy additions) */}
      <FeaturesSection />
      <StatisticsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Call to Action */}
      <CTASection />

      <Footer />
    </div>
  );
}

function EmergencyResponseSection() {
  const { t } = useLanguage();
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-40 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            India's Digital Emergency Grid
          </h2>
          <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
            SwasthAI maps critical medical infrastructure across India to reduce response times and save lives when seconds matter.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Emergency Response Time", value: "<5 mins", icon: "⚡" },
            { label: "Partner Responders", value: "15,000+", icon: "🚑" },
            { label: "Real-time Registered Beds", value: "500K+", icon: "🛏️" },
            { label: "Regional Locations", value: "Pan-India", icon: "🏥" },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition-all"
            >
              <div className="text-4xl mb-3">{metric.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {metric.value}
              </div>
              <p className="text-foreground/70 text-sm font-bold">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreviewSection() {
  const { t } = useLanguage();
  
  const previews = [
    {
      title: "Hospital Bed Discovery",
      desc: "Query live hospital bed registries by category (AIIMS, Private, Govt Trauma, Cardiac units). Sorted by exact proximity to your location.",
      href: "/hospitals",
      icon: "🏥",
      btnText: "Find Nearest Beds",
    },
    {
      title: "Real-time Blood Stocks",
      desc: "Check instant availability of blood group inventory (A+, B-, O+, etc.) across partner regional blood banks in India.",
      href: "/blood-banks",
      icon: "🩸",
      btnText: "Check Blood Stock",
    },
    {
      title: "Pharmacy Savings Hub",
      desc: "Identify generic alternative drugs registered under Jan Aushadhi and calculate up to 80% pricing savings compared to brand names.",
      href: "/pharmacy",
      icon: "💊",
      btnText: "Open Savings Catalog",
    },
    {
      title: "AI Clinical Triage",
      desc: "Input symptoms (chest pain, fever, dizzy) and get diagnostic classifications, risk levels, and facility recommendations.",
      href: "/triage",
      icon: "🤖",
      btnText: "Analyze Symptoms",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 border-t border-border/40 bg-black/5 dark:bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">Emergency Resources at Your Fingertips</h2>
          <p className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto mt-3">
            Fully functional modules designed to connect patient requests to verified medical responders instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {previews.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 sm:p-8 border border-white/20 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-foreground/60 leading-relaxed mb-6">{item.desc}</p>
              </div>
              <Link
                to={item.href}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all w-fit"
              >
                {item.btnText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function TestimonialsSection() {
  const reviews = [
    {
      quote: "SwasthAI saved my father's life. When he experienced sudden chest pain, we clicked the SOS button. Within 4 minutes, it directed us to the Safdarjung Apex Cardiac unit with verified availability and contacts.",
      author: "Rajesh K., Delhi",
      role: "Cardiac Emergency Case",
      stars: 5,
    },
    {
      quote: "The pharmacy savings calculator is unbelievable. My mother's daily diabetes and blood pressure medications cost us ₹3,400 monthly. SwasthAI matched them with generic Jan Aushadhi alternatives, dropping the bill to just ₹650!",
      author: "Priya S., Mumbai",
      role: "Medicine Cost Management",
      stars: 5,
    },
    {
      quote: "We needed rare O- negative blood during surgery. The stock checker pointed us directly to the Chennai Voluntary Blood Bank, which had 5 units ready. Verified and completely accurate.",
      author: "Dr. Arvind M., Chennai",
      role: "Clinical Practitioner",
      stars: 5,
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">Life-Saving Experiences</h2>
          <p className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto mt-3">
            Stories from patients and healthcare professionals who utilized SwasthAI in critical scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <motion.div
              key={rev.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 border border-white/20 flex flex-col justify-between hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-foreground/80 italic leading-relaxed mb-6">
                  "{rev.quote}"
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground">{rev.author}</h4>
                <span className="text-xs text-primary font-bold">{rev.role}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is SwasthAI and how does it work?",
      a: "SwasthAI is an AI-powered emergency healthcare network designed for India. It aggregates real-time bed inventories, blood bank stocks, generic pharmacy savings, and symptom triage systems to give citizens immediate life-saving recommendations in critical situations.",
    },
    {
      q: "How does the SOS Panic Button function?",
      a: "When you trigger the SOS button, a 5-second cancel countdown initiates. Once complete, it securely reads your exact GPS coordinates and requests dispatch, identifying the nearest appropriate trauma facility (like cardiac or burn units) and returning first-aid instructions.",
    },
    {
      q: "Is an account mandatory to use the emergency SOS?",
      a: "No. During an emergency, you can use the 'Emergency Guest Access' mode to trigger SOS dispatches, locate blood banks, or search hospitals instantly without registering.",
    },
    {
      q: "How accurate are the medicine savings comparisons?",
      a: "All generic alternative listings are matched using active Indian pharmacopoeia catalogs against government-registered PM Bhartiya Janaushadhi Kendra prices, assuring equivalent efficacy with up to 80% cost reductions.",
    },
    {
      q: "How does the global language switcher work?",
      a: "You can toggle the language menu in the navbar instantly. SwasthAI fully translates all landing sections, interactive lookup forms, buttons, and alert logs across 10 major Indian languages without page refreshes.",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 border-t border-border/40 bg-black/5 dark:bg-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
          <p className="text-sm text-foreground/50 mt-2">Answers to common inquiries about the SwasthAI platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-xl border border-white/20 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-5 py-4 font-bold text-sm sm:text-base flex items-center justify-between text-foreground hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-lg font-bold">{openIndex === index ? "−" : "+"}</span>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 pt-1 text-xs sm:text-sm text-foreground/60 leading-relaxed border-t border-border/20 bg-white/10 dark:bg-black/10">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden border-t border-border/40">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 pointer-events-none" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
              Secure Your Family's Health Grid
            </h2>
            <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
              Join thousands of families across India relying on SwasthAI for emergency coordination, verified resources, and pharmaceutical savings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/emergency"
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              Access SOS System
            </Link>
            <Link
              to="/triage"
              className="px-8 py-4 glass text-primary font-bold rounded-xl hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all text-center"
            >
              Run Symptom Triage Check
            </Link>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 text-xs text-foreground/50 pt-8 font-semibold"
          >
            <div className="flex items-center space-x-1.5">
              <span>✓</span>
              <span>No registration needed for Guest SOS</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span>🔐</span>
              <span>Encrypted Data Secure</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span>⚡</span>
              <span>Instant Proximity Match</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
