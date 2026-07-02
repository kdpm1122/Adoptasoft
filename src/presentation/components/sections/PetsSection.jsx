// src/presentation/components/sections/PetsSection.jsx
import { PetRegisterForm } from "../forms/PetRegisterForm";
import { PetListItem } from "../ui/PetListItem";

export function PetsSection({ pets, onCreatePet, onUploadPhoto }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-dark">🐾 Mis Mascotas</h2>
        <p className="text-sm text-text-muted">Registra y gestiona tus animales</p>
      </div>

      <PetRegisterForm onCreate={onCreatePet} />

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-text-muted">MIS MASCOTAS</p>
      <div className="flex flex-col gap-3">
        {pets.map((pet) => (
          <PetListItem key={pet.id} pet={pet} onUploadPhoto={onUploadPhoto} />
        ))}
      </div>
    </div>
  );
}
