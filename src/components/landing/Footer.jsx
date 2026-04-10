import React from "react";
import { Shield, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-heading text-sm font-bold tracking-wide text-foreground">
            BeamPD<span className="text-accent">:</span> Response
          </span>
        </div>
        <p className="text-xs font-body text-muted-foreground text-center">
          Not affiliated with BeamNG GmbH. This is a community-made mod.
        </p>
        <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
          Made with <Heart className="w-3 h-3 text-accent mx-1" /> for the BeamNG community
        </div>
      </div>
    </footer>
  );
}