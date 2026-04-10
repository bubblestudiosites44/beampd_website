import React from "react";

const categories = ["All", "Callout Pack", "Vehicle Pack", "Map Add-on", "Sound Pack", "UI Skin", "Script & Logic", "Other"];

export default function PluginFilters({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-all ${
            active === cat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-muted-foreground/40 hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}