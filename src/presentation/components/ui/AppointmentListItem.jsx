// src/presentation/components/ui/AppointmentListItem.jsx
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { ratingRepository } from "../../../infrastructure/repositories/ratingRepository";

function Stars({ value, onChange, readOnly }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`text-lg leading-none ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          {(hover || value) >= n ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

export function AppointmentListItem({ appointment, canRate, onRated }) {
  const [isRating, setIsRating] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [localRating, setLocalRating] = useState(appointment.rating || null);

  async function handleSubmitRating() {
    if (!stars) return;
    setIsSaving(true);
    setError(null);
    try {
      await ratingRepository.create(appointment.id, stars, comment.trim() || null);
      setLocalRating(stars);
      setIsRating(false);
      onRated?.(appointment.id, stars);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const showRateButton = canRate && appointment.status === "Atendida" && !localRating && !isRating;

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📅</span>
          <div>
            <p className="font-semibold text-text-dark">
              {appointment.petName} — {appointment.type}
            </p>
            <p className="text-xs text-text-muted">
              {appointment.vetName} · {appointment.date} · {appointment.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {localRating && <Stars value={localRating} readOnly />}
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {showRateButton && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsRating(true)}
            className="rounded-lg border border-primary-light px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-light/20"
          >
            ⭐ Calificar atención
          </button>
        </div>
      )}

      {isRating && (
        <div className="mt-3 rounded-lg bg-warm-cream/60 p-3">
          <p className="mb-1 text-xs font-semibold text-text-dark">¿Cómo fue tu experiencia?</p>
          <Stars value={stars} onChange={setStars} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentario opcional..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-border px-2 py-1 text-xs"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsRating(false)} className="rounded-lg border border-border px-3 py-1 text-xs text-text-muted hover:bg-white">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={isSaving || !stars}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {isSaving ? "Enviando..." : "Enviar calificación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
