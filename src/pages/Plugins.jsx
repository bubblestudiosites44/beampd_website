import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Shield, ArrowLeft, Package, LogIn } from "lucide-react";
import PluginCard from "../components/plugins/PluginCard";
import PluginFilters from "../components/plugins/PluginFilters";
import UserMenu from "../components/plugins/UserMenu";
import { motion } from "framer-motion";
import { getSession, logOut } from "@/lib/pluginAuth";
import { db } from "@/api/base44Client";

const FALLBACK_PLUGIN_IMAGE = "/hithtesteets.png";
const FALLBACK_PLUGIN_DOWNLOAD =
  "https://hbbtegiecallsiajrunj.supabase.co/storage/v1/object/public/BeamPD/BeamPD_Response.zip";

const fallbackPlugins = [
  {
    id: "fallback-beampd-plugin",
    name: "BeamPD Official Plugin Pack",
    category: "Callout Pack",
    author: "BeamPD Team",
    version: "1.0.0",
    description: "Official plugin pack fallback while database content is loading.",
    long_description:
      "This fallback plugin appears if your database query fails so users can still install BeamPD assets.",
    image_url: FALLBACK_PLUGIN_IMAGE,
    download_url: FALLBACK_PLUGIN_DOWNLOAD,
    downloads: 0,
    views: 0,
    rating: 0,
    rating_count: 0,
    is_public: true,
  },
];

export default function Plugins() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    let isMounted = true;
    const loadPlugins = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await db.entities.Plugin.filter({ is_public: true }, "-created_date", 100);
        if (!isMounted) return;
        setPlugins(data);
      } catch (error) {
        console.error("Failed to load plugins:", error);
        if (!isMounted) return;
        setLoadError("Could not load plugins from database. Showing fallback content.");
        setPlugins(fallbackPlugins);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPlugins();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogOut = () => {
    logOut();
    setSession(null);
  };

  const filtered = plugins.filter((p) => {
    const matchCat = activeFilter === "All" || p.category === activeFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="w-7 h-7 text-primary" />
              <div className="absolute inset-0 w-7 h-7 bg-primary/20 rounded-full blur-md" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              BeamPD<span className="text-accent">:</span> Response
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <UserMenu session={session} onLogOut={handleLogOut} />
            ) : (
              <Link
                to="/plugins/login"
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Publish
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">Community Plugins</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
            Extend Your<br /><span className="text-primary">BeamPD</span> Experience
          </h1>
          <p className="font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Community-made add-ons that plug directly into BeamPD: Response. Click any plugin to view details and download.
          </p>
        </motion.div>
      </div>

      {/* Filters + Search */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {loadError && (
          <div className="mb-6 rounded-xl bg-secondary border border-border px-4 py-3 text-sm font-body text-muted-foreground">
            {loadError}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <PluginFilters active={activeFilter} onChange={setActiveFilter} />
          <input
            type="text"
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground font-body">
            No plugins found. Try a different filter or search term.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((plugin, i) => (
              <PluginCard key={plugin.id} plugin={plugin} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="text-center py-12 text-xs font-body text-muted-foreground px-6">
        {session ? (
          <span>Signed in as <span className="text-primary">{session.username}</span> · <Link to="/plugins/publish" className="text-primary hover:underline">Publish a plugin</Link></span>
        ) : (
          <span>Want to publish a plugin? <Link to="/plugins/login" className="text-primary hover:underline">Sign in or create an account</Link></span>
        )}
      </div>
    </div>
  );
}
