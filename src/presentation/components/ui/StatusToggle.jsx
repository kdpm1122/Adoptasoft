// src/presentation/components/ui/StatusToggle.jsx
import { PET_STATUS } from "../../../domain/entities/Pet";

const OPTIONS = [
  { value: PET_STATUS.ACTIVE, label: "Activo", activeClass: "border-green-300 bg-green-100 text-green-700 shadow-sm" },
  { value: PET_STATUS.PENDING, label: "Pendiente", activeClass: "border-yellow-300 bg-yellow-100 text-yellow-700 shadow-sm" },
  { value: PET_STATUS.REJECTED, label: "Rechazado", activeClass: "border-red-300 bg-red-100 text-red-600 shadow-sm" },
];

// Toggle de 3 estados: muestra los 3 posibles estados de un paciente,
// resalta el actual y permite cambiarlo con un clic.
export function StatusToggle({ status, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const isActive = status === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out ${
              isActive ? opt.activeClass : "border-border bg-white text-text-muted hover:border-primary-light hover:shadow-sm"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
