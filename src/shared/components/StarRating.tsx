import { Star } from "lucide-react";

export function StarRating({
  rating,
  reviewCount,
  className = "",
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5"
            fill={i < rounded ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      {typeof reviewCount === "number" && (
        <span className="text-xs opacity-60">({reviewCount})</span>
      )}
    </div>
  );
}
