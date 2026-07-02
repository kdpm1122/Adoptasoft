// src/presentation/components/sections/MedicalHistorySection.jsx
import { MedicalRecordItem } from "../ui/MedicalRecordItem";

export function MedicalHistorySection({ pets = [], selectedPetId, onPetChange, petName, records, onExportPdf, onExportWord, onShare }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text-dark">📋 Historial Médico</h2>
          <p className="text-sm text-text-muted">{petName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pets.length > 1 && (
            <select
              value={selectedPetId || ""}
              onChange={(e) => onPetChange?.(e.target.value)}
              className="rounded-lg border border-border bg-warm-cream px-3 py-2 text-xs font-semibold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button onClick={onExportPdf} className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
            📄 Exportar PDF
          </button>
          <button onClick={onExportWord} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-dark hover:bg-warm-cream">
            📝 Exportar Word
          </button>
          <button onClick={onShare} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-dark hover:bg-warm-cream">
            📤 Compartir
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {records.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
            Esta mascota aún no tiene registros médicos.
          </p>
        )}
        {records.map((r) => (
          <MedicalRecordItem key={r.id} record={r} />
        ))}
      </div>
    </div>
  );
}
