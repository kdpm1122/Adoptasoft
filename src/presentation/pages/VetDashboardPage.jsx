// src/presentation/pages/VetDashboardPage.jsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
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
        setPatients(petsData.map((p) => ({ id: p.id, name: p.name, species: p.species, breed: p.breed, ownerId: p.ownerId, ownerName: p.ownerName, status: p.status })));
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
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-text-dark">📅 Mi Agenda</h2><p className="text-sm text-text-muted">Citas del día</p></div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-3">
              {todaysAppointments.length === 0 && <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">No tienes citas para este día.</p>}
              {todaysAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕐</span>
                    <div>
                      <p className="font-semibold text-text-dark">{appt.time} — {appt.petName}</p>
                      <p className="text-xs text-text-muted">{appt.type} {appt.reason ? `· ${appt.reason}` : ""}</p>
                    </div>
                  </div>
                  <select
                    value={appt.status}
                    onChange={(e) => handleChangeAppointmentStatus(appt.id, e.target.value)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appt.status] || ""}`}
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
      <DashboardLayout subtitle="Panel Veterinario" roleLabel="Veterinario" roleIcon="🩺" navItems={VET_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
        <p className="text-text-muted">Cargando datos...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout subtitle="Panel Veterinario" roleLabel="Veterinario" roleIcon="🩺" navItems={VET_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
      {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">No se pudieron cargar los datos: {loadError}</div>}
      {activeNav === "inicio" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-text-dark">🏠 Panel Veterinario</h1><p className="text-text-muted">Bienvenido de vuelta, {doctorName}</p></div>
            <button onClick={() => { setSelectedPatientId(""); setActiveNav("registrar"); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark">+ Registrar Consulta</button>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value={todaysAppointments.length} label="Citas Hoy" accent="orange" />
            <StatCard value={patients.filter((p) => p.status === PET_STATUS.ACTIVE).length} label="Pacientes Activos" accent="yellow" />
            <StatCard value={appointments.filter((a) => a.status === "Confirmada").length} label="Confirmadas" accent="green" />
            <StatCard value={appointments.filter((a) => a.status === "Pendiente").length} label="Pendientes" accent="blue" />
          </div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-text-muted">ACCESOS RÁPIDOS</p>
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickAccessCard icon="📅" title="Mi Agenda" description="Citas del día" highlighted onClick={() => setActiveNav("agenda")} />
            <QuickAccessCard icon="🐾" title="Mis Pacientes" description="Historial y registros" onClick={() => setActiveNav("pacientes")} />
            <QuickAccessCard icon="📋" title="Registrar Consulta" description="Diagnóstico y vacunas" onClick={() => setActiveNav("registrar")} />
            <QuickAccessCard icon="💬" title="Mensajes" description="Consultas de dueños" onClick={() => setActiveNav("mensajes")} />
              <QuickAccessCard icon="📊" title="Reportes" description="Estadísticas de pacientes" />
          </div>
        </>
      )}
      {renderSection()}
    </DashboardLayout>
  );
}
