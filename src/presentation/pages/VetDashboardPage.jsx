// src/presentation/pages/VetDashboardPage.jsx
import { useState, useEffect } from "react";
import { CalendarDays, PawPrint, ClipboardList, MessageCircle, BarChart3, CalendarCheck2, HeartPulse, CheckCircle2, Clock3, Plus, Clock } from "lucide-react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/ui/StatCard";
import { QuickAccessCard } from "../components/ui/QuickAccessCard";
import { PatientsSection } from "../components/sections/PatientsSection";
import { RegisterConsultSection } from "../components/sections/RegisterConsultSection";
import { MessagesSection } from "../components/sections/MessagesSection";
import { ProfileSection } from "../components/sections/ProfileSection";
import { VET_NAV } from "../../shared/constants/navigation";
import { PET_STATUS } from "../../domain/entities/Pet";
import { petRepository } from "../../infrastructure/repositories/petRepository";
import { appointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { medicalRecordRepository } from "../../infrastructure/repositories/medicalRecordRepository";

const STATUS_STYLES = { Pendiente: "bg-yellow-100 text-yellow-700", Confirmada: "bg-green-100 text-green-700", Rechazada: "bg-red-100 text-red-600", Cancelada: "bg-gray-100 text-gray-600", Atendida: "bg-blue-100 text-blue-700" };
const APPOINTMENT_STATUSES = ["Pendiente", "Confirmada", "Rechazada", "Cancelada", "Atendida"];

function formatToday() {
  const str = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function VetDashboardPage({ doctorName = "Dr.", onLogout, currentUser }) {
  const [activeNav, setActiveNav] = useState("inicio");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true); setLoadError(null);
      try {
        const [petsData, appointmentsData] = await Promise.all([petRepository.list(), appointmentRepository.list()]);
        if (cancelled) return;
        setPatients(petsData.map((p) => ({ id: p.id, name: p.name, species: p.species, breed: p.breed, ownerId: p.ownerId, ownerName: p.ownerName, status: p.status, photoUrl: p.photoUrl })));
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
    if (!selectedPatientId) { setRecords([]); return; }
    let cancelled = false;
    medicalRecordRepository.list(selectedPatientId).then((data) => {
      if (cancelled) return;
      setRecords(data.map((r) => ({ id: r.id, petId: r.petId, type: r.type, title: r.description, doctor: r.vetName, date: r.date, nextDate: r.nextDate, detail: r.treatment ? `Tratamiento: ${r.treatment}` : undefined })));
    }).catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [selectedPatientId]);

  async function handleChangeStatus(patientId, status) {
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, status } : p)));
    await petRepository.update(patientId, { status });
  }

  async function handleChangeAppointmentStatus(appointmentId, status) {
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status } : a)));
    await appointmentRepository.update(appointmentId, { status });
  }

  function handleViewHistory(patientId) { setSelectedPatientId(String(patientId)); setActiveNav("registrar"); }

  async function handleSaveRecord(formData) {
    const created = await medicalRecordRepository.create(formData);
    setRecords((prev) => [{ id: created.id, petId: created.petId, type: created.type, title: created.description, doctor: doctorName, date: created.date, nextDate: created.nextDate || undefined, detail: created.treatment ? `Tratamiento: ${created.treatment}` : undefined }, ...prev]);
    setSelectedPatientId(String(formData.patientId));
  }

  const todaysAppointments = appointments.filter((a) => a.date === date);
  const firstName = (doctorName || "").replace(/^Dr\.?a?\.?\s*/i, "") || doctorName;

  function renderSection() {
    switch (activeNav) {
      case "perfil": return <ProfileSection user={currentUser} />;
      case "pacientes": return <PatientsSection patients={patients} onChangeStatus={handleChangeStatus} onViewHistory={handleViewHistory} />;
      case "mensajes": {
        const uniqueOwners = Array.from(
          new Map(patients.filter((p) => p.ownerId).map((p) => [p.ownerId, p])).values()
        ).map((p) => ({ id: p.ownerId, name: p.ownerName, role: "owner" }));
        return <MessagesSection contacts={uniqueOwners} />;
      }
      case "registrar":
        return <RegisterConsultSection patients={patients} selectedPatientId={selectedPatientId} onPatientChange={setSelectedPatientId} records={records} onSave={handleSaveRecord} onCancel={() =>setSelectedPatientId("")} />;
      case "agenda":
        return (
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-text-dark">
                  <CalendarDays className="h-5 w-5 text-primary" strokeWidth={2.25} /> Mi Agenda
                </h2>
                <p className="text-sm text-text-muted">Citas del día</p>
              </div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm shadow-sm" />
            </div>
            <div className="flex flex-col gap-3">
              {todaysAppointments.length === 0 && (
                <EmptyState icon={CalendarDays} title="Sin citas para este día" description="Cuando tengas citas agendadas aparecerán aquí." />
              )}
              {todaysAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between rounded-xl border border-border bg-warm-cream/40 px-4 py-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div>
                      <p className="font-semibold text-text-dark">{appt.time} — {appt.petName}</p>
                      <p className="text-xs text-text-muted">{appt.type} {appt.reason ? `· ${appt.reason}` : ""}</p>
                    </div>
                  </div>
                  <select
                    value={appt.status}
                    onChange={(e) => handleChangeAppointmentStatus(appt.id, e.target.value)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold shadow-sm ${STATUS_STYLES[appt.status] || ""}`}
                  >
                    {APPOINTMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout subtitle="Panel Veterinario" roleLabel="Veterinario" roleIcon="🩺" photoUrl={currentUser?.photoUrl} navItems={VET_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout subtitle="Panel Veterinario" roleLabel="Veterinario" roleIcon="🩺" photoUrl={currentUser?.photoUrl} navItems={VET_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
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
                  Bienvenido, {firstName} <span aria-hidden>🩺</span>
                </h1>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  {todaysAppointments.length > 0
                    ? `Tienes ${todaysAppointments.length} cita${todaysAppointments.length === 1 ? "" : "s"} programada${todaysAppointments.length === 1 ? "" : "s"} para hoy.`
                    : "No tienes citas programadas para hoy."}
                </p>
              </div>
              <button
                onClick={() => { setSelectedPatientId(""); setActiveNav("registrar"); }}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Registrar Consulta
              </button>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={CalendarCheck2} value={todaysAppointments.length} label="Citas Hoy" accent="orange" />
            <StatCard icon={HeartPulse} value={patients.filter((p) => p.status === PET_STATUS.ACTIVE).length} label="Pacientes Activos" accent="yellow" />
            <StatCard icon={CheckCircle2} value={appointments.filter((a) => a.status === "Confirmada").length} label="Confirmadas" accent="green" />
            <StatCard icon={Clock3} value={appointments.filter((a) => a.status === "Pendiente").length} label="Pendientes" accent="blue" />
          </div>

          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
            <span className="h-px flex-1 bg-border" />
            ACCESOS RÁPIDOS
            <span className="h-px flex-1 bg-border" />
          </p>
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickAccessCard icon={<CalendarDays className="h-5 w-5" strokeWidth={2.25} />} title="Mi Agenda" description="Citas del día" highlighted onClick={() => setActiveNav("agenda")} />
            <QuickAccessCard icon={<PawPrint className="h-5 w-5" strokeWidth={2.25} />} title="Mis Pacientes" description="Historial y registros" onClick={() => setActiveNav("pacientes")} />
            <QuickAccessCard icon={<ClipboardList className="h-5 w-5" strokeWidth={2.25} />} title="Registrar Consulta" description="Diagnóstico y vacunas" onClick={() => setActiveNav("registrar")} />
            <QuickAccessCard icon={<MessageCircle className="h-5 w-5" strokeWidth={2.25} />} title="Mensajes" description="Consultas de dueños" onClick={() => setActiveNav("mensajes")} />
            <QuickAccessCard icon={<BarChart3 className="h-5 w-5" strokeWidth={2.25} />} title="Reportes" description="Estadísticas de pacientes" />
          </div>
        </>
      )}
      {renderSection()}
    </DashboardLayout>
  );
}
