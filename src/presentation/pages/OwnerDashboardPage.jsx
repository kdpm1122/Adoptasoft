// src/presentation/pages/OwnerDashboardPage.jsx
import { useState, useEffect } from "react";
import { PawPrint, CalendarClock, ShieldCheck, Syringe, CalendarPlus, ClipboardList, MessageCircle, Plus } from "lucide-react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { LoadingState } from "../components/ui/LoadingState";
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

function formatToday() {
  const str = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function OwnerDashboardPage({ onLogout, currentUser }) {
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
  const firstName = (currentUser?.name || "").split(" ")[0] || "de nuevo";

  function renderSection() {
    switch (activeNav) {
      case "mascotas": return <PetsSection pets={pets} onCreatePet={handleCreatePet} onUploadPhoto={handleUploadPetPhoto} />;
      case "citas": return <AppointmentsSection pets={pets} vets={vets} appointments={appointments} onConfirm={handleConfirmAppointment} canRate onRated={(id, stars) => setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, rating: stars } : a)))} />;
      case "perfil": return <ProfileSection user={currentUser} />;
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
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
              <span className="h-px flex-1 bg-border" />
              ACCESOS RÁPIDOS
              <span className="h-px flex-1 bg-border" />
            </p>
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickAccessCard icon={<PawPrint className="h-5 w-5" strokeWidth={2.25} />} title="Mis Mascotas" description="Gestiona tus animales" onClick={() => setActiveNav("mascotas")} />
              <QuickAccessCard icon={<CalendarPlus className="h-5 w-5" strokeWidth={2.25} />} title="Agendar Cita" description="Selecciona turno disponible" highlighted onClick={() => setActiveNav("citas")} />
              <QuickAccessCard icon={<ClipboardList className="h-5 w-5" strokeWidth={2.25} />} title="Historial Médico" description="Vacunas y diagnósticos" onClick={() => setActiveNav("historial")} />
              <QuickAccessCard icon={<MessageCircle className="h-5 w-5" strokeWidth={2.25} />} title="Chat con Veterinario" description="Consultas en línea" onClick={() => setActiveNav("mensajes")} />
            </div>
          </>
        );
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout subtitle="Gestión de Mascotas" roleLabel="Dueño" roleIcon="🐶" photoUrl={currentUser?.photoUrl} navItems={OWNER_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout subtitle="Gestión de Mascotas" roleLabel="Dueño" roleIcon="🐶" photoUrl={currentUser?.photoUrl} navItems={OWNER_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
      {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">No se pudieron cargar los datos: {loadError}</div>}
      {activeNav === "inicio" && (
        <>
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-7 text-white shadow-soft sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 animate-float-slow rounded-full bg-white/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 animate-float-slower rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{formatToday()}</p>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  ¡Hola, {firstName}! <span aria-hidden>🐾</span>
                </h1>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  Esto es lo que está pasando hoy con tus mascotas.
                </p>
              </div>
              <button
                onClick={() => setActiveNav("citas")}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Nueva Cita
              </button>
            </div>
          </div>

          {vaccineAlerts.length > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-4 shadow-card">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-200 text-yellow-800">
                <Syringe className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-bold text-yellow-800">Vacunas próximas</p>
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
            </div>
          )}

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={PawPrint} value={pets.length} label="Mis Mascotas" accent="orange" />
            <StatCard icon={CalendarClock} value={appointments.length} label="Cita Próxima" accent="yellow" />
            <StatCard icon={ShieldCheck} value={pets.filter((p) => p.status === PET_STATUS.ACTIVE).length} label="Vacunas al día" accent="green" />
            <StatCard icon={Syringe} value={vaccineAlerts.length} label="Vacunas Pendientes" accent="blue" />
          </div>
        </>
      )}
      {renderSection()}
    </DashboardLayout>
  );
}
