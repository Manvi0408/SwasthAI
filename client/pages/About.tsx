import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Compass, HeartPulse, Activity, Users, ShieldCheck } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const metrics = [
    { label: "Emergency Responses", value: "250K+" },
    { label: "Integrated Hospitals", value: "8,500+" },
    { label: "Active Blood Donors", value: "1.2M+" },
    { label: "Generic Drug Savings", value: "₹45M+" },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      desc: "Providing verified clinical information, real-time bed configurations, and genuine drug comparisons.",
      icon: ShieldCheck,
    },
    {
      title: "Rapid Connectivity",
      desc: "Linking users to closest trauma care responders in under 5 minutes to compress critical delay gaps.",
      icon: Activity,
    },
    {
      title: "Universal Inclusivity",
      desc: "Delivering fully operational platform workflows in 10 major Indian vernacular languages.",
      icon: Users,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-zinc-105 flex flex-col font-sans grid-bg">
      <Navigation />
      <div className="pt-32 pb-24 flex-grow bg-black/60">
        
        {/* Banner Section */}
        <section className="py-16 text-left max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-3xl"
          >
            <span className="text-xs font-semibold tracking-wider text-accent uppercase mb-3 block">
              India's Digital Health Mission
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {t("about.title")}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl pt-2">
              We are building the intelligent emergency response network for India, aligning technology and healthcare infrastructure to save lives when seconds matter.
            </p>
          </motion.div>
        </section>

        {/* Vision & Mission */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 shadow-2xl relative"
          >
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center justify-center mb-6">
              <Compass className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{t("about.mission")}</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              To bridge the critical coordination gap in emergency response across India. By deploying real-time database lookups, instant location indexing, and localized clinical checks, we ensure that every citizen finds immediate aid, clean blood, and cheap generic alternatives without delay.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 shadow-2xl relative"
          >
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center justify-center mb-6">
              <Award className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{t("about.vision")}</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              To transform emergency care into a seamless, trusted, zero-friction experience. We envision a future where language barriers, search fragmentation, and drug pricing opacity are eliminated, establishing SwasthAI as India's primary health hub.
            </p>
          </motion.div>
        </section>

        {/* Statistics Metric Strip */}
        <section className="bg-zinc-950/40 border-y border-zinc-900 py-12 my-12">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="text-left space-y-1.5">
                <div className="text-3xl font-extrabold text-white">
                  {m.value}
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
          <h2 className="text-2xl font-bold text-white text-center mb-10 tracking-tight">{t("about.values")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, index) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg p-6 shadow-2xl transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center justify-center mb-4">
                    <Icon className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
