// src/presentation/components/sections/PetsSection.jsx
import { PetRegisterForm } from "../forms/PetRegisterForm";
import { PetListItem } from "../ui/PetListItem";
import { EmptyState } from "../ui/EmptyState";

export function PetsSection({ pets, onCreatePet, onUploadPhoto }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-dark">🐾 Mis Mascotas</h2>
        <p className="text-sm text-text-muted">Registra y gestiona tus animales</p>
      </div>

      <PetRegisterForm onCreate={onCreatePet} />

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-text-muted">MIS MASCOTAS</p>
      {pets.length === 0 && (
        <EmptyState title="Aún no tienes mascotas" description="Regístralas con el formulario de arriba para verlas aquí." />
      )}
      <div className="flex flex-col gap-3">
        {pets.map((pet, i) => (
          <div key={pet.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 90, 450)}ms` }}>
            <PetListItem pet={pet} onUploadPhoto={onUploadPhoto} />
          </div>
        ))}
      </div>
    </div>
  );
}
