// src/presentation/components/sections/AppointmentsSection.jsx
import { AppointmentForm } from "../forms/AppointmentForm";
import { AppointmentListItem } from "../ui/AppointmentListItem";

export function AppointmentsSection({ pets, vets, appointments, onConfirm, canRate, onRated }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-dark">📅 Citas</h2>
        <p className="text-sm text-text-muted">Agenda y administra tus citas veterinarias</p>
      </div>

      <AppointmentForm pets={pets} vets={vets} onConfirm={onConfirm} />

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-text-muted">MIS CITAS</p>
      <div className="flex flex-col gap-3">
        {appointments.map((appt) => (
          <AppointmentListItem key={appt.id} appointment={appt} canRate={canRate} onRated={onRated} />
        ))}
      </div>
    </div>
  );
}
