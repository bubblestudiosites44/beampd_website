import React from "react";
import { motion } from "framer-motion";

export default function ShowcaseSection({ showcaseImage }) {
  return (
    <section id="showcase" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-body font-semibold tracking-widest uppercase text-accent">In Action</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3">
            Hit the Streets
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Experience high-stakes policing with realistic AI, dynamic scenarios, and immersive patrol gameplay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/5"
        >
          <img
            src={showcaseImage}
            alt="BeamPD Response gameplay showcase"
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-3">
              {["Callouts", "Pursuits", "Traffic Stops", "Backup Units", "Spike Strips"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/50 text-xs font-body font-medium text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}