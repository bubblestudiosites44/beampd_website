import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, MessageSquare, Search, LogIn, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/api/base44Client";
import { getSession, hydrateSession, logOut } from "@/lib/pluginAuth";

const CATEGORIES = ["General", "Support", "Bug Reports", "Showcase", "Plugins"];

const inputClassName =
  "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

function formatPostedAt(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "just now";

  const deltaSeconds = Math.round((Date.now() - timestamp) / 1000);
  const abs = Math.abs(deltaSeconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (abs < 60) return rtf.format(-deltaSeconds, "second");
  if (abs < 3600) return rtf.format(-Math.round(deltaSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(-Math.round(deltaSeconds / 3600), "hour");
  return rtf.format(-Math.round(deltaSeconds / 86400), "day");
}

export default function Forum() {
  const [session, setSession] = useState(getSession());
  const [loadingSession, setLoadingSession] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    content: "",
  });

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      try {
        const nextSession = await hydrateSession();
        if (!mounted) return;
        setSession(nextSession);
      } catch {
        if (!mounted) return;
        setSession(getSession());
      } finally {
        if (mounted) setLoadingSession(false);
      }
    };

    syncSession();
    return () => {
      mounted = false;
    };
  }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    setLoadError("");
    try {
      const data = await db.entities.ForumPost.filter({}, "-created_date", 200);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load forum posts:", error);
      setLoadError("Could not load forum posts from the database.");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
      const title = String(post.title || "").toLowerCase();
      const content = String(post.content || "").toLowerCase();
      const author = String(post.author_username || "").toLowerCase();
      const category = String(post.category || "").toLowerCase();
      return (
        title.includes(query) ||
        content.includes(query) ||
        author.includes(query) ||
        category.includes(query)
      );
    });
  }, [posts, search]);

  const onFormChange = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleSignOut = () => {
    logOut();
    setSession(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!session) {
      setSubmitError("Please sign in before posting.");
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();

    if (title.length < 4) {
      setSubmitError("Title must be at least 4 characters.");
      return;
    }

    if (content.length < 8) {
      setSubmitError("Post content must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const authUserId =
        session.auth_user_id || (await db.auth.me())?.id || null;
      if (!authUserId) {
        throw new Error("Please sign out and sign in again, then try posting.");
      }

      await db.entities.ForumPost.create({
        title,
        content,
        category: form.category,
        author_account_id: session.id,
        author_auth_user_id: authUserId,
        author_username: session.username,
      });
      setForm({ title: "", category: CATEGORIES[0], content: "" });
      await loadPosts();
    } catch (error) {
      console.error("Failed to create forum post:", error);
      setSubmitError(
        error?.message || "Failed to publish your post. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="flex items-center gap-3">
            {loadingSession ? (
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
            ) : session ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground hover:border-primary/40 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out ({session.username})</span>
                <span className="sm:hidden">Sign Out</span>
              </button>
            ) : (
              <Link
                to="/plugins/login"
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">
              Community Forum
            </span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-3">
            BeamPD Forum
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl leading-relaxed">
            Ask questions, report issues, and share setups with the BeamPD community.
            Signing in is required to create a post.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                Create Post
              </h2>
              {!session && !loadingSession && (
                <p className="text-sm font-body text-muted-foreground mb-4">
                  Sign in with your plugin account to post in the forum.
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={onFormChange("title")}
                    placeholder="Short summary of your topic"
                    className={inputClassName}
                    disabled={!session || submitting}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={onFormChange("category")}
                    className={inputClassName}
                    disabled={!session || submitting}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Content
                  </label>
                  <textarea
                    value={form.content}
                    onChange={onFormChange("content")}
                    rows={7}
                    placeholder="Explain your issue, idea, or tip in detail."
                    className={`${inputClassName} resize-none`}
                    disabled={!session || submitting}
                    required
                  />
                </div>

                {submitError && (
                  <p className="text-sm font-body text-accent bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!session || submitting}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-base tracking-wide rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Posting..." : "Create Post"}
                </button>
              </form>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-card border border-border p-6 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts by title, content, author, or category..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {loadError && (
              <div className="rounded-xl bg-secondary border border-border px-4 py-3 text-sm font-body text-muted-foreground mb-4">
                {loadError}
              </div>
            )}

            {loadingPosts ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl bg-card border border-border p-10 text-center">
                <p className="font-body text-muted-foreground">
                  No forum posts found. Be the first to start a thread.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-body font-medium text-primary">
                        {post.category || "General"}
                      </span>
                      <span className="text-xs font-body text-muted-foreground">
                        Posted {formatPostedAt(post.created_date)}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                      {post.title}
                    </h3>
                    <p className="font-body text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                    <p className="mt-4 text-xs font-body text-muted-foreground">
                      by{" "}
                      <span className="text-foreground font-semibold">
                        {post.author_username || "Unknown"}
                      </span>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
