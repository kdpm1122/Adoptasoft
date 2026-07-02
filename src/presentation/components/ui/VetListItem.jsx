// src/presentation/components/ui/VetListItem.jsx
import { StatusBadge } from "./StatusBadge";

export function VetListItem({ vet }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-cream text-xl">🩺</div>
        <div>
          <p className="font-semibold text-text-dark">{vet.name}</p>
          <p className="text-xs text-text-muted">{vet.summaryLine ? vet.summaryLine() : vet.specialty}</p>
          {vet.rating != null && (
            <p className="text-xs text-yellow-600">
              ⭐ {vet.rating} ({vet.ratingCount} {vet.ratingCount === 1 ? "reseña" : "reseñas"})
            </p>
          )}
        </div>
      </div>
      <StatusBadge status={vet.status} />
    </div>
  );
}
