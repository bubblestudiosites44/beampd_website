import React from "react";
import StarRating from "./StarRating";
import { User } from "lucide-react";
import { format } from "date-fns";

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return <p className="text-sm font-body text-muted-foreground py-4">No reviews yet. Be the first!</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl bg-secondary/40 border border-border p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-body font-medium text-foreground">{r.reviewer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={r.rating} size="sm" />
              <span className="text-xs text-muted-foreground font-body">
                {r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : ""}
              </span>
            </div>
          </div>
          {r.comment && <p className="text-sm font-body text-muted-foreground leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}