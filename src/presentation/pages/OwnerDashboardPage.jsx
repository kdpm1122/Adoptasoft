// src/presentation/pages/OwnerDashboardPage.jsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { StatCard } from "../components/ui/StatCard";
import { QuickAccessCard } from "../components/ui/QuickAccessCard";
import { PetsSection } from "../components/sections/PetsSection";
import { AppointmentsSection } from "../components/sections/AppointmentsSection";
import { MedicalHistorySection } from "../components/sections/MedicalHistorySection";
import { MessagesSection } from "../components/sections/MessagesSection";
import { ProfileSection } from "../components/sections/ProfileSection";
import { OWNER_NAV } from "../../shared/constants/navigation";
import { Pet, PET_STATUS } from "../../domain/entities/Pet";
import { petRepository } from "../../infrastructure/repositories/petRepository";
import { vetRepository } from "../../infrastructure/repositories/vetRepository";
import { appointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { medicalRecordRepository } from "../../infrastructure/repositories/medicalRecordRepository";
import { exportToPdf, exportToWord } from "../../shared/utils/exportHistory";

const VACCINE_ALERT_DAYS = 30;

function toRecordViewModel(r) {
  const detailParts = [];
  if (r.weight) detailParts.push(`Peso: ${r.weight} kg`);
  if (r.treatment) detailParts.push(`Tratamiento: ${r.treatment}`);
  return { id: r.id, type: r.type, title: r.description, doctor: r.vetName, date: r.date, nextDate: r.nextDate, detail: detailParts.join(" — ") || null };
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function OwnerDashboardPage({ onLogout, currentUser, onPhotoChange }) {
  const [activeNav, setActiveNav] = useState("inicio");
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [vaccineAlerts, setVaccineAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true); setLoadError(null);
      try {
        const [petsData, vetsData, appointmentsData] = await Promise.all([petRepository.list(), vetRepository.list(), appointmentRepository.list()]);
        if (cancelled) return;
        setPets(petsData.map((p) => new Pet(p)));
        setVets(vetsData);
        setAppointments(appointmentsData);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (pets.length === 0) { setSelectedPetId(""); return; }
    setSelectedPetId((prev) => (prev && pets.some((p) => String(p.id) === String(prev)) ? prev : String(pets[0].id)));
  }, [pets]);

  useEffect(() => {
    if (!selectedPetId) { setRecords([]); return; }
    let cancelled = false;
    medicalRecordRepository.list(selectedPetId).then((data) => { if (!cancelled) setRecords(data.map(toRecordViewModel)); }).catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [selectedPetId]);

  useEffect(() => {
    if (pets.length === 0) return;
    let cancelled = false;
    Promise.all(
      pets.map((pet) =>
        medicalRecordRepository.list(pet.id).then((data) => data.map((r) => ({ ...r, petName: pet.name })))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const all = results.flat();
        const upcoming = all
          .filter((r) => r.nextDate)
          .map((r) => ({ ...r, daysLeft: daysUntil(r.nextDate) }))
          .filter((r) => r.daysLeft <= VACCINE_ALERT_DAYS)
          .sort((a, b) => a.daysLeft - b.daysLeft);
        setVaccineAlerts(upcoming);
      })
      .catch(() => { /* no bloquea el resto del dashboard si esto falla */ });
    return () => { cancelled = true; };
  }, [pets]);

  async function handleCreatePet(petData) {
    const created = await petRepository.create(petData);
    setPets((prev) => [...prev, new Pet(created)]);
  }

  async function handleUploadPetPhoto(petId, photoUrl) {
    await petRepository.update(petId, { photoUrl });
    setPets((prev) => prev.map((p) => (String(p.id) === String(petId) ? new Pet({ ...p, photoUrl }) : p)));
  }

  async function handleConfirmAppointment(formData) {
    const created = await appointmentRepository.create(formData);
    const pet = pets.find((p) => String(p.id) === String(formData.petId));
    const vet = vets.find((v) => String(v.id) === String(formData.vetId));
    setAppointments((prev) => [{ ...created, petName: pet?.name || "Mascota", vetName: vet?.name || "Por asignar" }, ...prev]);
  }

  const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId));

  function renderSection() {
    switch (activeNav) {
      case "mascotas": return <PetsSection pets={pets} onCreatePet={handleCreatePet} onUploadPhoto={handleUploadPetPhoto} />;
      case "citas": return <AppointmentsSection pets={pets} vets={vets} appointments={appointments} onConfirm={handleConfirmAppointment} canRate onRated={(id, stars) => setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, rating: stars } : a)))} />;
      case "perfil": return <ProfileSection user={currentUser} onPhotoChange={onPhotoChange} />;
      case "mensajes":
        return <MessagesSection contacts={vets.map((v) => ({ id: v.id, name: v.name, role: "vet" }))} />;
      case "historial":
        return (
          <MedicalHistorySection
            pets={pets}
            selectedPetId={selectedPetId}
            onPetChange={setSelectedPetId}
            petName={`${selectedPet?.name || ""} — ${selectedPet?.breed || ""}`}
            records={records}
            onExportPdf={() => exportToPdf(`${selectedPet?.name || "mascota"} — ${selectedPet?.breed || ""}`, records)}
            onExportWord={() => exportToWord(`${selectedPet?.name || "mascota"} — ${selectedPet?.breed || ""}`, records)}
            onShare={() => { if (navigator.share) { navigator.share({ title: `Historial de ${selectedPet?.name}`, text: "Historial médico generado desde Adoptasoft." });} else { navigator.clipboard.writeText(window.location.href); alert("Enlace copiado al portapapeles."); } }}
          />
        );
      default:
        return (
          <>
            <p className="mb-3 text-xs font-semibold tracking-wide text-text-muted">ACCESOS RÁPIDOS</p>
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickAccessCard icon="🐾" title="Mis Mascotas" description="Gestiona tus animales" onClick={() => setActiveNav("mascotas")} />
              <QuickAccessCard icon="📅" title="Agendar Cita" description="Selecciona turno disponible" highlighted onClick={() => setActiveNav("citas")} />
              <QuickAccessCard icon="📋" title="Historial Médico" description="Vacunas y diagnósticos" onClick={() => setActiveNav("historial")} />
              <QuickAccessCard icon="💬" title="Chat con Veterinario" description="Consultas en línea" onClick={() => setActiveNav("mensajes")} />
            </div>
          </>
        );
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout subtitle="Gestión de Mascotas" roleLabel="Dueño" roleIcon="🐶" photoUrl={currentUser?.photoUrl} navItems={OWNER_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
        <p className="text-text-muted">Cargando datos...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout subtitle="Gestión de Mascotas" roleLabel="Dueño" roleIcon="🐶" photoUrl={currentUser?.photoUrl} navItems={OWNER_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
      {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">No se pudieron cargar los datos: {loadError}</div>}
      {activeNav === "inicio" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-text-dark">🏠 Inicio</h1><p className="text-text-muted">Resumen de tus mascotas y citas</p></div>
            <button onClick={() => setActiveNav("citas")} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark">+ Nueva Cita</button>
          </div>
          {vaccineAlerts.length > 0 && (
            <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3">
              <p className="mb-2 text-sm font-bold text-yellow-800">💉 Vacunas próximas</p>
              <ul className="flex flex-col gap-1">
                {vaccineAlerts.map((a) => (
                  <li key={a.id} className="text-xs text-yellow-800">
                    <strong>{a.petName}</strong>: {a.description || "Control"} —{" "}
                    {a.daysLeft < 0
                      ? `venció hace ${Math.abs(a.daysLeft)} día(s)`
                      : a.daysLeft === 0
                      ? "es hoy"
                      : `en ${a.daysLeft} día(s)`}{" "}
                    ({a.nextDate})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value={pets.length} label="Mis Mascotas" accent="orange" />
            <StatCard value={appointments.length} label="Cita Próxima" accent="yellow" />
            <StatCard value={pets.filter((p) => p.status === PET_STATUS.ACTIVE).length} label="Vacunas al día" accent="green" />
            <StatCard value={vaccineAlerts.length} label="Vacunas Pendientes" accent="blue" />
          </div>
        </>
      )}
      {renderSection()}
    </DashboardLayout>
  );
}
