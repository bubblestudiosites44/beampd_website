import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { completeXirakoLogin } from "@/lib/pluginAuth";

export default function XirakoAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const finalizeLogin = async () => {
      try {
        await completeXirakoLogin(window.location.hash);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
        if (!active) return;
        navigate("/plugins", { replace: true });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Could not finish Xirako sign in.");
      }
    };

    finalizeLogin();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              BeamPD<span className="text-accent">:</span> Response
            </span>
          </Link>
          <Link
            to="/plugins/login"
            className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl bg-card border border-border p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>

            {error ? (
              <>
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  Xirako Sign-In Failed
                </h1>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  {error}
                </p>
                <Link
                  to="/plugins/login"
                  className="inline-flex items-center justify-center px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-base tracking-wide rounded-xl hover:bg-primary/90 transition-all"
                >
                  Return to Login
                </Link>
              </>
            ) : (
              <>
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  Finishing Xirako Sign-In
                </h1>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  We&apos;re connecting your BeamPD account now.
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
