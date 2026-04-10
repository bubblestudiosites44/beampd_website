import React from "react";
import { motion } from "framer-motion";
import { Siren, Radio, Route, ShieldAlert, Users, Settings } from "lucide-react";

const features = [
  {
    icon: Siren,
    title: "Dynamic Callouts",
    description: "Respond to diverse emergencies — traffic stops, pursuits, robberies, accidents, and more. Every patrol is different.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20"
  },
  {
    icon: Radio,
    title: "Backup System",
    description: "Request AI-driven backup units that respond to your location with realistic behavior and sirens.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    icon: Route,
    title: "Pursuit Management",
    description: "Engage in high-speed chases with intelligent suspect AI, spike strips, and roadblock deployment.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20"
  },
  {
    icon: ShieldAlert,
    title: "Traffic Control",
    description: "Pull over vehicles, issue citations, conduct searches, and manage traffic incidents like a real officer.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20"
  },
  {
    icon: Users,
    title: "BeamMP Server Support",
    description: "Running a BeamMP server? Drop the mod into your server's mod folder and your players can patrol together.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20"
  },
  {
    icon: Settings,
    title: "Fully Configurable",
    description: "Customize keybinds, callout frequency, vehicle loadouts, and department settings to your liking.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-body font-semibold tracking-widest uppercase text-primary">What's Inside</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3">
            Built for the Beat
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Everything you need for the most immersive police experience in BeamNG.drive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className={`group relative p-6 rounded-2xl bg-card/60 backdrop-blur-sm border ${feature.border} hover:bg-card transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}