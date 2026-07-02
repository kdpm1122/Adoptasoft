// src/domain/entities/Veterinarian.js

export const VET_STATUS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export const SPECIALTY_OPTIONS = [
  "Medicina General",
  "Cirugía",
  "Dermatología",
  "Cardiología",
  "Odontología",
  "Oftalmología",
];

export const SCHEDULE_OPTIONS = [
  "7:00 a.m.",
  "8:00 a.m.",
  "9:00 a.m.",
  "10:00 a.m.",
  "11:00 a.m.",
  "12:00 p.m.",
  "1:00 p.m.",
  "2:00 p.m.",
  "3:00 p.m.",
  "4:00 p.m.",
  "5:00 p.m.",
  "6:00 p.m.",
  "7:00 p.m.",
  "8:00 p.m.",
];

// Convierte "8:00 a.m." -> 8, "5:00 p.m." -> 17 (para mostrar horarios en formato 24h corto)
function to24h(label) {
  const match = /^(\d{1,2}):00\s*(a\.m\.|p\.m\.)$/i.exec(label || "");
  if (!match) return label || "";
  let hour = parseInt(match[1], 10);
  const isPM = /p/i.test(match[2]);
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour;
}

export class Veterinarian {
  constructor({
    id,
    name,
    specialty,
    clinic,
    medicalLicense,
    scheduleStart,
    scheduleEnd,
    status = VET_STATUS.ACTIVE,
    rating = null,
    ratingCount = 0,
  }) {
    this.id = id;
    this.name = name;
    this.specialty = specialty;
    this.clinic = clinic;
    this.medicalLicense = medicalLicense;
    this.scheduleStart = scheduleStart;
    this.scheduleEnd = scheduleEnd;
    this.status = status;
    this.rating = rating;
    this.ratingCount = ratingCount;
  }

  // Nota: el formulario no pide días de la semana todavía, por eso queda fijo "Lun–Vie".
  // Si más adelante se necesita configurar días, se puede agregar ese campo al formulario.
  scheduleLabel() {
    return `Lun–Vie ${to24h(this.scheduleStart)}–${to24h(this.scheduleEnd)}h`;
  }

  summaryLine() {
    return [this.specialty, this.clinic, this.scheduleLabel()].filter(Boolean).join(" · ");
  }
}
