import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shield, ArrowLeft, Download, User, Tag, HardDrive, Cpu, Package, Eye } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import StarRating from "../components/plugins/StarRating";
import ReviewList from "../components/plugins/ReviewList";
import ReviewForm from "../components/plugins/ReviewForm";
import { db } from "@/api/base44Client";

const OFFICIAL_FALLBACK_DOWNLOAD =
  "https://hbbtegiecallsiajrunj.supabase.co/storage/v1/object/public/BeamPD/BeamPD_Response.zip";
const FALLBACK_IMAGE = "/hithtesteets.png";

const categoryColors = {
  "Callout Pack": "bg-accent/10 text-accent border-accent/20",
  "Vehicle Pack": "bg-primary/10 text-primary border-primary/20",
  "Map Add-on": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "UI Skin": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Sound Pack": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Script & Logic": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Other: "bg-muted text-muted-foreground border-border",
};

export default function PluginDetail() {
  const { id } = useParams();
  const [plugin, setPlugin] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadPlugin = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [pluginData, reviewData] = await Promise.all([
          db.entities.Plugin.filter({ id }).then((r) => r[0] ?? null),
          db.entities.PluginReview.filter({ plugin_id: id }, "-created_date", 50),
        ]);
        if (!isMounted) return;
        setPlugin(pluginData);
        setReviews(reviewData ?? []);

        if (pluginData) {
          db.entities.Plugin.update(pluginData.id, { views: (pluginData.views ?? 0) + 1 }).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to load plugin detail:", error);
        if (!isMounted) return;
        setLoadError("Could not load plugin details from the database.");
        setPlugin(null);
        setReviews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPlugin();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!plugin) return;
    db.entities.Plugin.update(plugin.id, { downloads: (plugin.downloads ?? 0) + 1 }).catch(() => {});
    setPlugin((p) => ({ ...p, downloads: (p.downloads ?? 0) + 1 }));
    db.analytics.track({
      eventName: "BeamPD_plugin_download",
      properties: { plugin_id: plugin.id, plugin_name: plugin.name, category: plugin.category },
    });
  };

  const handleReviewSubmitted = async () => {
    const newReviews = await db.entities.PluginReview.filter({ plugin_id: id }, "-created_date", 50);
    setReviews(newReviews ?? []);
    if (newReviews?.length > 0) {
      const avg = newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length;
      await db.entities.Plugin.update(plugin.id, { rating: avg, rating_count: newReviews.length });
      setPlugin((p) => ({ ...p, rating: avg, rating_count: newReviews.length }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">{loadError || "Plugin not found."}</p>
        <Link to="/plugins" className="text-primary font-body text-sm hover:underline">
          Back to Plugins
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden h-56 md:h-72 bg-gradient-to-br from-secondary to-muted mb-8 border border-border"
        >
          {plugin.image_url ? (
            <img
              src={plugin.image_url}
              alt={plugin.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-heading text-8xl font-bold text-border select-none">{plugin.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${
                categoryColors[plugin.category] ?? "bg-muted text-muted-foreground border-border"
              }`}
            >
              {plugin.category}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-10"
          >
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">{plugin.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-body text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>{(plugin.downloads ?? 0).toLocaleString()} downloads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{(plugin.views ?? 0).toLocaleString()} views</span>
                </div>
                {plugin.rating_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={plugin.rating ?? 0} size="sm" />
                    <span>
                      {(plugin.rating ?? 0).toFixed(1)} ({plugin.rating_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <p className="font-body text-muted-foreground mb-8">{plugin.description}</p>

              <div
                className="prose prose-invert prose-sm max-w-none font-body
                prose-headings:font-heading prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground prose-strong:text-foreground
                prose-h2:text-2xl prose-h3:text-lg prose-h3:mt-4"
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="font-body text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                        {children}
                      </p>
                    ),
                  }}
                >
                  {plugin.long_description || plugin.description}
                </ReactMarkdown>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Reviews
                {reviews.length > 0 && (
                  <span className="text-muted-foreground font-body text-base font-normal ml-2">
                    ({reviews.length})
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-6">
                <ReviewForm pluginId={plugin.id} onSubmitted={handleReviewSubmitted} />
                <ReviewList reviews={reviews} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl bg-card border border-primary/30 p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Version</p>
                <p className="font-heading text-xl font-bold text-foreground">v{plugin.version}</p>
              </div>
              <a
                href={
                  plugin.download_url && plugin.download_url !== "#"
                    ? plugin.download_url
                    : OFFICIAL_FALLBACK_DOWNLOAD
                }
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-base tracking-wide rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Download className="w-5 h-5" />
                Download .zip
              </a>
              {plugin.file_size && (
                <p className="text-xs text-center text-muted-foreground font-body">{plugin.file_size}</p>
              )}
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-body">Author</p>
                  <p className="text-sm font-body font-medium text-foreground">{plugin.author}</p>
                </div>
              </div>
              {plugin.file_size && (
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-body">File Size</p>
                    <p className="text-sm font-body font-medium text-foreground">{plugin.file_size}</p>
                  </div>
                </div>
              )}
              {plugin.beamng_version && (
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-body">BeamNG Version</p>
                    <p className="text-sm font-body font-medium text-foreground">{plugin.beamng_version}+</p>
                  </div>
                </div>
              )}
              {plugin.beampd_version && (
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-body">BeamPD Version</p>
                    <p className="text-sm font-body font-medium text-foreground">{plugin.beampd_version}+</p>
                  </div>
                </div>
              )}
              {plugin.tags?.length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-body mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plugin.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-secondary text-xs font-body text-secondary-foreground border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

