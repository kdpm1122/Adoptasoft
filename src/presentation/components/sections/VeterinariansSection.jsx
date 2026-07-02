// src/presentation/components/sections/VeterinariansSection.jsx
import { RegisterVetForm } from "../forms/RegisterVetForm";
import { VetListItem } from "../ui/VetListItem";
import { EmptyState } from "../ui/EmptyState";

export function VeterinariansSection({ vets, onCreateVet }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-dark">🩺 Veterinarios</h2>
        <p className="text-sm text-text-muted">Gestión de especialistas del sistema</p>
      </div>

      <RegisterVetForm onCreate={onCreateVet} />

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-text-muted">VETERINARIOS ACTIVOS</p>
      {vets.length === 0 && (
        <EmptyState title="Aún no hay veterinarios" description="Regístralos con el formulario de arriba." />
      )}
      <div className="flex flex-col gap-3">
        {vets.map((vet, i) => (
          <div key={vet.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 90, 450)}ms` }}>
            <VetListItem vet={vet} />
          </div>
        ))}
      </div>
    </div>
  );
}
