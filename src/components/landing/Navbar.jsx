import React from "react";
import { Shield, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar({ onDownloadClick }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-7 h-7 text-primary" />
            <div className="absolute inset-0 w-7 h-7 bg-primary/20 rounded-full blur-md" />
          </div>
          <span className="font-heading text-xl font-bold tracking-wide text-foreground">
            BeamPD<span className="text-accent">:</span> Response
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("features")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("showcase")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Showcase</button>
          <button onClick={() => scrollTo("download")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Download</button>
          <Link to="/plugins" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Plugins</Link>
          <Link to="/forum" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Forum</Link>
          <button
            onClick={onDownloadClick}
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-heading font-semibold tracking-wide rounded-lg hover:bg-primary/90 transition-all"
          >
            INSTALL NOW
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <button onClick={() => scrollTo("features")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors text-left">Features</button>
              <button onClick={() => scrollTo("showcase")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors text-left">Showcase</button>
              <button onClick={() => scrollTo("download")} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors text-left">Download</button>
              <Link to="/plugins" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors text-left">Plugins</Link>
              <Link to="/forum" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors text-left">Forum</Link>
              <button
                onClick={onDownloadClick}
                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-heading font-semibold tracking-wide rounded-lg hover:bg-primary/90 transition-all w-full"
              >
                INSTALL NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
