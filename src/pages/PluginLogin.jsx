import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { signUp, logIn } from "@/lib/pluginAuth";

export default function PluginLogin({ onAuth }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    identifier: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let account;
      if (mode === "login") {
        account = await logIn(form.identifier, form.password);
      } else {
        if (!form.email) throw new Error("Email is required.");
        account = await signUp(form.username, form.email, form.password);
      }
      if (onAuth) onAuth(account);
      navigate("/plugins");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            to="/plugins"
            className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plugins
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {mode === "login"
                  ? "Sign in to publish and manage your plugins."
                  : "Join the community and share your plugins."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  {mode === "login" ? "Username or Email" : "Username"}
                </label>
                <input
                  type="text"
                  value={mode === "login" ? form.identifier : form.username}
                  onChange={set(mode === "login" ? "identifier" : "username")}
                  required
                  placeholder={mode === "login" ? "your_username or you@example.com" : "your_username"}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    required
                    placeholder="********"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm font-body text-accent bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-base tracking-wide rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              {mode === "login" ? (
                <p className="text-sm font-body text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

