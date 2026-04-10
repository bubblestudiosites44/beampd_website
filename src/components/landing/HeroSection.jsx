import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection({ heroImage, onDownloadClick }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Police vehicle with emergency lights"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/hithtesteets.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      </div>

      {/* Police light flares */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse-blue pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-pulse-red pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">
              Now Available for BeamNG.drive
            </span>
          </div>

          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none mb-4">
            <span className="text-foreground">Beam</span>
            <span className="text-primary">PD</span>
            <span className="text-accent">:</span>
            <br />
            <span className="text-foreground">Response</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
            The ultimate police roleplay mod for BeamNG.drive. Dynamic callouts, 
            AI backup units, pursuit management, and a fully immersive law enforcement experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onDownloadClick}
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-heading font-bold text-lg tracking-wide rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            DOWNLOAD NOW
          </button>
          <Link
            to="/docs"
            className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-heading font-semibold text-lg tracking-wide rounded-xl hover:bg-secondary transition-all"
          >
            LEARN MORE
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
