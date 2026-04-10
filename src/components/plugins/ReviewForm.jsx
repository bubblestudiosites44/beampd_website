import React, { useState } from "react";
import StarRating from "./StarRating";
import { db } from "@/api/base44Client";

export default function ReviewForm({ pluginId, onSubmitted }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rating) return;
    setSubmitting(true);
    await db.entities.PluginReview.create({ plugin_id: pluginId, reviewer_name: name, rating, comment });
    setName(""); setRating(0); setComment("");
    setSubmitting(false);
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-card border border-border p-5 flex flex-col gap-4">
      <h4 className="font-heading text-base font-bold text-foreground">Leave a Review</h4>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Your Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Officer Mike"
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Rating</label>
        <StarRating rating={rating} size="lg" interactive onRate={setRating} />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience with this plugin..."
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !name || !rating}
        className="w-full py-2.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide rounded-lg hover:bg-primary/90 transition-all disabled:opacity-40"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
