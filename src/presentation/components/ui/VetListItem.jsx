// src/presentation/components/ui/VetListItem.jsx
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { ratingRepository } from "../../../infrastructure/repositories/ratingRepository";

export function VetListItem({ vet }) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleToggleReviews() {
    if (showReviews) {
      setShowReviews(false);
      return;
    }
    setShowReviews(true);
    if (reviews !== null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ratingRepository.list(vet.id);
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-cream text-xl">🩺</div>
          <div>
            <p className="font-semibold text-text-dark">{vet.name}</p>
            <p className="text-xs text-text-muted">{vet.summaryLine ? vet.summaryLine() : vet.specialty}</p>
            {vet.rating != null && (
              <button
                type="button"
                onClick={handleToggleReviews}
                className="text-xs text-yellow-600 underline decoration-dotted hover:text-yellow-700"
              >
                ⭐ {vet.rating} ({vet.ratingCount} {vet.ratingCount === 1 ? "reseña" : "reseñas"}) — {showReviews ? "ocultar" : "ver reseñas"}
              </button>
            )}
          </div>
        </div>
        <StatusBadge status={vet.status} />
      </div>

      {showReviews && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {isLoading && <p className="text-xs text-text-muted">Cargando reseñas...</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {reviews && reviews.length === 0 && (
            <p className="text-xs text-text-muted">Aún no hay reseñas.</p>
          )}
          {reviews && reviews.map((r) => (
            <div key={r.id} className="rounded-lg bg-warm-cream/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-dark">{r.ownerName}</span>
                <span className="text-xs text-yellow-600">{"⭐".repeat(r.stars)}</span>
              </div>
              {r.comment && <p className="mt-1 text-xs text-text-muted">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
