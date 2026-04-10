import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Upload, LogOut, ChevronDown, Settings } from "lucide-react";

export default function UserMenu({ session, onLogOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-border hover:border-primary/40 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-body text-foreground hidden sm:block">{session.username}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card border border-border shadow-xl shadow-black/30 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-body text-muted-foreground">Signed in as</p>
            <p className="text-sm font-body font-semibold text-foreground truncate">{session.username}</p>
          </div>
          <div className="py-1">
            <Link
              to="/plugins/publish"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors"
            >
              <Upload className="w-4 h-4 text-primary" />
              Publish Plugin
            </Link>
            <Link
              to="/plugins/manage"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Manage Plugins
            </Link>
            <button
              onClick={() => { setOpen(false); onLogOut(); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}