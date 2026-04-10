import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = "sm", interactive = false, onRate }) {
  const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${s} transition-colors ${
            i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/40"
          } ${interactive ? "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400" : ""}`}
          onClick={() => interactive && onRate && onRate(i + 1)}
        />
      ))}
    </div>
  );
}