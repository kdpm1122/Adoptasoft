// src/domain/entities/Pet.js

export const PET_STATUS = {
  ACTIVE: "Activo",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
};

export class Pet {
  constructor({ id, name, species, breed, age, weight, sex, ownerId, status = PET_STATUS.ACTIVE, photoUrl = null }) {
    this.id = id;
    this.name = name;
    this.species = species;
    this.breed = breed;
    this.age = age;
    this.weight = weight;
    this.sex = sex;
    this.ownerId = ownerId;
    this.status = status;
    this.photoUrl = photoUrl;
  }

  summaryLine() {
    const parts = [this.breed, this.age, this.weight ? `${this.weight} kg` : null, this.sex].filter(Boolean);
    return parts.join(" · ");
  }
}

export const SPECIES_OPTIONS = ["Perro", "Gato", "Ave", "Roedor", "Reptil", "Otro"];
export const SEX_OPTIONS = ["Macho", "Hembra"];
