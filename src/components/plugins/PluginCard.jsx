import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tag, User, Download, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const categoryColors = {
  "Callout Pack": "bg-accent/10 text-accent border-accent/20",
  "Vehicle Pack": "bg-primary/10 text-primary border-primary/20",
  "Map Add-on": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "UI Skin": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Sound Pack": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Script & Logic": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Other": "bg-muted text-muted-foreground border-border",
};

export default function PluginCard({ plugin, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      className="flex flex-col rounded-2xl bg-card border border-border hover:border-border/80 transition-all duration-300 overflow-hidden group"
    >
      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-secondary to-muted overflow-hidden">
        {plugin.image_url ? (
          <img src={plugin.image_url} alt={plugin.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-heading text-5xl font-bold text-border select-none">{plugin.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-body font-semibold border ${categoryColors[plugin.category] ?? "bg-muted text-muted-foreground border-border"}`}>
          {plugin.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground leading-tight">{plugin.name}</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{plugin.description}</p>

        <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{plugin.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>v{plugin.version}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-body text-muted-foreground pt-1 border-t border-border">
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            <span>{(plugin.downloads ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{(plugin.views ?? 0).toLocaleString()}</span>
          </div>
          {plugin.rating_count > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-foreground">{(plugin.rating ?? 0).toFixed(1)}</span>
              <span>({plugin.rating_count})</span>
            </div>
          )}
        </div>

        <Link
          to={`/plugins/${plugin.id}`}
          className="mt-1 flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-sm tracking-wide rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          View & Download
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}