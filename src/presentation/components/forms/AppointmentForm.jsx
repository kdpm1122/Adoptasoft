// src/presentation/components/forms/AppointmentForm.jsx
import { useState, useEffect } from "react";
import { validateAppointmentForm } from "../../../domain/services/appointmentValidation";
import { CONSULTATION_TYPES } from "../../../domain/entities/Appointment";
import { appointmentRepository } from "../../../infrastructure/repositories/appointmentRepository";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { TimeSlot } from "../ui/TimeSlot";

const ALL_SLOTS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "08:30", "09:30"];

const initialForm = { petId: "", vetId: "", type: "", date: "", reason: "", time: "" };

export function AppointmentForm({ pets = [], vets = [], onConfirm }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [takenSlots, setTakenSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  function setField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value, ...(field === "vetId" || field === "date" ? { time: "" } : {}) }));
  }

  useEffect(() => {
    if (!formData.vetId || !formData.date) {
      setTakenSlots([]);
      return;
    }
    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotsError(null);
    appointmentRepository
      .getTakenSlots(formData.vetId, formData.date)
      .then((slots) => { if (!cancelled) setTakenSlots(slots); })
      .catch((err) => { if (!cancelled) setSlotsError(err.message); })
      .finally(() => { if (!cancelled) setIsLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [formData.vetId, formData.date]);

  function handleConfirm() {
    const { isValid, errors: validationErrors } = validateAppointmentForm(formData);
    setErrors(validationErrors);
    if (!isValid) return;
    onConfirm?.(formData);
    setFormData(initialForm);
    setTakenSlots([]);
  }

  function handleClear() {
    setFormData(initialForm);
    setErrors({});
    setTakenSlots([]);
  }

  const needsVetAndDate = !formData.vetId || !formData.date;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-text-dark">📅 Nueva Cita Veterinaria</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-dark">MASCOTA *</label>
          <select
            value={formData.petId}
            onChange={(e) => setField("petId", e.target.value)}
            className="rounded-xl border border-border bg-warm-cream px-4 py-3 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccionar</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.petId && <span className="text-xs text-red-500">{errors.petId}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-dark">VETERINARIO</label>
          <select
            value={formData.vetId}
            onChange={(e) => setField("vetId", e.target.value)}
            className="rounded-xl border border-border bg-warm-cream px-4 py-3 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccionar</option>
            {vets.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wide text-text-dark">TIPO DE CONSULTA</label>
          <select
            value={formData.type}
            onChange={(e) => setField("type", e.target.value)}
            className="rounded-xl border border-border bg-warm-cream px-4 py-3 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">—</option>
            {CONSULTATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <TextField
          label="FECHA *"
          type="date"
          value={formData.date}
          onChange={(e) => setField("date", e.target.value)}
          error={errors.date}
        />

        <div className="md:col-span-2">
          <TextField
            label="MOTIVO"
            placeholder="Descripción breve"
            value={formData.reason}
            onChange={(e) => setField("reason", e.target.value)}
          />
        </div>
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-text-muted">
        TURNOS DISPONIBLES {formData.vetId && vets.find((v) => v.id === formData.vetId) ? `· ${vets.find((v) => v.id === formData.vetId).name}` : ""}
        {formData.date ? ` · ${formData.date}` : ""}
      </p>
      {needsVetAndDate ? (
        <p className="mb-2 rounded-lg border border-dashed border-border px-4 py-3 text-xs text-text-muted">
          Selecciona veterinario y fecha para ver los turnos disponibles.
        </p>
      ) : isLoadingSlots ? (
        <p className="mb-2 rounded-lg border border-dashed border-border px-4 py-3 text-xs text-text-muted">
          Consultando disponibilidad...
        </p>
      ) : slotsError ? (
        <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          No se pudo consultar la disponibilidad: {slotsError}
        </p>
      ) : (
        <div className="mb-2 grid grid-cols-3 gap-2 md:grid-cols-5">
          {ALL_SLOTS.map((slot) => (
            <TimeSlot
              key={slot}
              time={slot}
              isTaken={takenSlots.includes(slot)}
              isSelected={formData.time === slot}
              onClick={(t) => setField("time", t)}
            />
          ))}
        </div>
      )}
      {errors.time && <span className="text-xs text-red-500">{errors.time}</span>}

      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <Button type="button" onClick={handleConfirm}>📅 Confirmar Cita</Button>
        <Button type="button" variant="secondary" onClick={handleClear}>Limpiar</Button>
      </div>
    </div>
  );
}
