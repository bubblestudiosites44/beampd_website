import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileArchive, Monitor, CheckCircle, Shield } from "lucide-react";
import { db } from "@/api/base44Client";

const typeConfig = {
  auto: {
    icon: Monitor,
    title: "Automatic Install",
    badge: "RECOMMENDED",
    perks: ["Auto-detects game folder", "Handles all dependencies", "One-click setup"],
    buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    cardClass: "border-primary/30 hover:border-primary/60",
    perkIconClass: "text-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  manual: {
    icon: FileArchive,
    title: "Manual Install",
    badge: null,
    perks: ["Full control over files", "No installer needed", "Portable option"],
    buttonClass: "border border-border text-foreground hover:bg-secondary",
    cardClass: "border-border hover:border-muted-foreground/30",
    perkIconClass: "text-muted-foreground",
    iconBg: "bg-secondary",
    iconColor: "text-muted-foreground",
  },
};

function DownloadCard({ entry }) {
  const cfg = typeConfig[entry.type] ?? typeConfig.manual;
  const Icon = cfg.icon;

  return (
    <div className={`group relative rounded-2xl bg-card border ${cfg.cardClass} p-8 transition-all duration-300 overflow-hidden flex flex-col`}>
      {cfg.badge && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-heading font-bold tracking-wider rounded-bl-xl">
          {cfg.badge}
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-6`}>
        <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
      </div>
      <h3 className="font-heading text-2xl font-bold text-foreground mb-1">{entry.label}</h3>
      <p className="text-xs font-body text-muted-foreground mb-4">Version {entry.version}</p>
      <ul className="space-y-2 mb-8 flex-1">
        {cfg.perks.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-body text-secondary-foreground">
            <CheckCircle className={`w-4 h-4 ${cfg.perkIconClass} flex-shrink-0`} />
            {item}
          </li>
        ))}
        {entry.changelog && (
          <li className="flex items-start gap-2 text-sm font-body text-muted-foreground pt-2 border-t border-border mt-2">
            <span className="leading-relaxed">{entry.changelog}</span>
          </li>
        )}
      </ul>
      {entry.coming_soon ? (
        <div className="flex items-center justify-center gap-3 w-full px-6 py-4 font-heading font-bold text-base tracking-wide rounded-xl bg-secondary border border-border text-muted-foreground cursor-not-allowed select-none">
          COMING SOON
        </div>
      ) : (
        <a
          href={entry.download_url ?? "#"}
          onClick={!entry.download_url || entry.download_url === "#" ? (e) => e.preventDefault() : undefined}
          className={`flex items-center justify-center gap-3 w-full px-6 py-4 font-heading font-bold text-base tracking-wide rounded-xl transition-all ${cfg.buttonClass}`}
        >
          <Download className="w-5 h-5" />
          Download {entry.type === "auto" ? ".exe" : ".zip"}
        </a>
      )}
      {entry.file_name && (
        <p className="text-xs text-muted-foreground font-body mt-3 text-center">
          {entry.file_name}{entry.file_size ? ` · ${entry.file_size}` : ""}
        </p>
      )}
    </div>
  );
}

export default function DownloadSection() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    db.entities.BeamPDDownload.filter({ is_active: true }).then((data) => {
      // sort: auto first
      setDownloads(data.sort((a, b) => (a.type === "auto" ? -1 : 1)));
    });
  }, []);

  return (
    <section id="download" className="relative py-32 px-6">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-body font-semibold tracking-widest uppercase text-primary">Get Started</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3">
            Download BeamPD: Response
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-lg mx-auto">
            Choose your preferred installation method. Both options get you the same full mod experience.
          </p>
        </motion.div>

        {downloads.length === 0 ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloads.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <DownloadCard entry={entry} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground font-body"
        >
          <Shield className="w-4 h-4" />
          <span>Compatible with BeamNG.drive v0.32+ · Virus-free &amp; open source</span>
        </motion.div>
      </div>
    </section>
  );
}
