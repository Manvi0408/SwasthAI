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
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="pt-24 pb-12 flex-grow">
        
        {/* Banner Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-3xl mx-auto"
          >
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest">
              India's Digital Health Mission
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {t("about.title")}
            </h1>
            <p className="text-lg text-foreground/60 leading-relaxed">
              We are building the intelligent emergency response network for India, aligning technology and healthcare infrastructure to save lives when seconds matter.
            </p>
          </motion.div>
        </section>

        {/* Vision & Mission */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 border border-white/20 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t("about.mission")}</h2>
            <p className="text-foreground/75 leading-relaxed">
              To bridge the critical coordination gap in emergency response across India. By deploying real-time database lookups, instant location indexing, and localized clinical checks, we ensure that every citizen finds immediate aid, clean blood, and cheap generic alternatives without delay.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 border border-white/20 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t("about.vision")}</h2>
            <p className="text-foreground/75 leading-relaxed">
              To transform emergency care into a seamless, trusted, zero-friction experience. We envision a future where language barriers, search fragmentation, and drug pricing opacity are eliminated, establishing SwasthAI as India's primary health hub.
            </p>
          </motion.div>
        </section>

        {/* Statistics Metric Strip */}
        <section className="bg-black/5 dark:bg-white/5 py-12 my-12 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="text-center space-y-1">
                <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/50 uppercase">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-extrabold text-center mb-12">{t("about.values")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, index) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{v.desc}</p>
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
