// src/presentation/components/sections/PatientsSection.jsx
import { useMemo, useState } from "react";
import { PatientListItem } from "../ui/PatientListItem";
import { EmptyState } from "../ui/EmptyState";

export function PatientsSection({ patients, onChangeStatus, onViewHistory }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q)
    );
  }, [patients, query]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-dark">🐾 Mis Pacientes</h2>
        <p className="text-sm text-text-muted">Todos los pacientes bajo tu cuidado</p>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o dueño..."
          className="flex-1 rounded-xl border border-border bg-warm-cream px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
        <button
          type="button"
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          🔍 Buscar
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <EmptyState title="No se encontraron pacientes" description="Prueba con otro nombre o el del dueño." />
        )}
        {filtered.map((patient, i) => (
          <div key={patient.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 90, 450)}ms` }}>
            <PatientListItem
              patient={patient}
              onChangeStatus={onChangeStatus}
              onViewHistory={onViewHistory}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
