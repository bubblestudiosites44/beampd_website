import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  LogIn,
  LogOut,
  Loader2,
  MessageCircle,
  Send,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/api/base44Client";
import { getSession, hydrateSession, logOut } from "@/lib/pluginAuth";

const inputClassName =
  "w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

function formatPostedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ForumThread() {
  const { id } = useParams();
  const [session, setSession] = useState(getSession());
  const [loadingSession, setLoadingSession] = useState(true);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      try {
        const nextSession = await hydrateSession();
        if (mounted) setSession(nextSession);
      } catch {
        if (mounted) setSession(getSession());
      } finally {
        if (mounted) setLoadingSession(false);
      }
    };

    syncSession();
    return () => {
      mounted = false;
    };
  }, []);

  const loadThread = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [postData, replyData] = await Promise.all([
        db.entities.ForumPost.get(id),
        db.entities.ForumReply.filter({ post_id: id }, "created_date", 500),
      ]);
      setPost(postData);
      setReplies(Array.isArray(replyData) ? replyData : []);
    } catch (error) {
      console.error("Failed to load forum thread:", error);
      setLoadError("Could not load this forum thread.");
      setPost(null);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
  }, [id]);

  const handleSignOut = () => {
    logOut();
    setSession(null);
  };

  const handleReply = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!session) {
      setSubmitError("Please sign in before replying.");
      return;
    }

    const content = reply.trim();
    if (content.length < 2) {
      setSubmitError("Reply must be at least 2 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const authUserId = session.auth_user_id || (await db.auth.me())?.id || null;
      if (!authUserId) {
        throw new Error("Please sign out and sign in again, then try replying.");
      }

      await db.entities.ForumReply.create({
        post_id: id,
        content,
        author_account_id: session.id,
        author_auth_user_id: authUserId,
        author_username: session.username,
      });
      setReply("");
      await loadThread();
    } catch (error) {
      console.error("Failed to create forum reply:", error);
      setSubmitError(error?.message || "Failed to publish your reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              BeamPD<span className="text-accent">:</span> Response
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {!loadingSession &&
              (session ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-border text-sm font-body text-foreground hover:border-primary/40 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/plugins/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              ))}
            <Link
              to="/forum"
              className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Forum
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {loading ? (
          <div className="py-32 flex justify-center">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : !post ? (
          <div className="rounded-2xl bg-card border border-border p-10 text-center">
            <p className="font-body text-muted-foreground mb-4">
              {loadError || "This thread could not be found."}
            </p>
            <Link to="/forum" className="text-primary font-body hover:underline">
              Return to the forum
            </Link>
          </div>
        ) : (
          <>
            <motion.article
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-accent" />
              <div className="p-7 md:p-9">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-body font-medium text-primary">
                    {post.category || "General"}
                  </span>
                  {post.is_locked && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-body text-yellow-400">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
                  {post.title}
                </h1>
                <p className="font-body text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
                <div className="mt-7 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-body text-muted-foreground">
                  <span>
                    Posted by <strong className="text-foreground">{post.author_username || "Unknown"}</strong>
                  </span>
                  <span>{formatPostedAt(post.created_date)}</span>
                </div>
              </div>
            </motion.article>

            <section className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {replies.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.25) }}
                    className="rounded-2xl bg-card border border-border p-6"
                  >
                    <p className="font-body text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>
                    <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-body text-muted-foreground">
                      <span>
                        Reply by <strong className="text-foreground">{item.author_username || "Unknown"}</strong>
                      </span>
                      <span>{formatPostedAt(item.created_date)}</span>
                    </div>
                  </motion.article>
                ))}

                {replies.length === 0 && (
                  <div className="rounded-2xl bg-secondary/40 border border-border border-dashed p-8 text-center">
                    <p className="font-body text-sm text-muted-foreground">
                      No replies yet. Start the conversation below.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8 rounded-2xl bg-card border border-border p-6 md:p-7">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Reply to Thread</h2>
              {!session && !loadingSession && (
                <p className="font-body text-sm text-muted-foreground mb-4">
                  <Link to="/plugins/login" className="text-primary hover:underline">Sign in</Link> to join the conversation.
                </p>
              )}
              {post.is_locked ? (
                <p className="flex items-center gap-2 font-body text-sm text-yellow-400">
                  <Lock className="w-4 h-4" /> This thread is locked and cannot receive replies.
                </p>
              ) : (
                <form onSubmit={handleReply} className="flex flex-col gap-4">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={5}
                    placeholder="Write your reply..."
                    className={`${inputClassName} resize-none`}
                    disabled={!session || submitting}
                    required
                  />
                  {submitError && (
                    <p className="text-sm font-body text-accent bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!session || submitting}
                    className="self-start flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-base tracking-wide rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Posting Reply..." : "Post Reply"}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
