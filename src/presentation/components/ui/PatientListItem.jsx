// src/presentation/components/ui/PatientListItem.jsx
import { useState } from "react";
import { StatusToggle } from "./StatusToggle";

const SPECIES_ICON = { Perro: "🐶", Gato: "🐱", Ave: "🐦", Roedor: "🐹", Reptil: "🦎", Otro: "🐾" };

export function PatientListItem({ patient, onChangeStatus, onViewHistory }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-warm-cream text-xl">
          {patient.photoUrl ? (
            <img src={patient.photoUrl} alt={patient.name} className="h-full w-full object-cover" />
          ) : (
            SPECIES_ICON[patient.species] || "🐾"
          )}
        </div>
        <div>
          <p className="font-semibold text-text-dark">
            {patient.name} — {patient.breed}
          </p>
          <p className="text-xs text-text-muted">
            Dueño: {patient.ownerName} · Última consulta: {patient.lastVisit || "—"}
          </p>
          {patient.photoUrl && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="mt-1 text-xs text-primary underline decoration-dotted hover:text-primary-dark"
            >
              👁️ Ver foto
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusToggle status={patient.status} onChange={(status) => onChangeStatus?.(patient.id, status)} />
        <button
          onClick={() => onViewHistory?.(patient.id)}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          Ver historial
        </button>
      </div>

      {lightboxOpen && patient.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={patient.photoUrl}
            alt={patient.name}
            className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-text-dark"
          >
            ✕ Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
