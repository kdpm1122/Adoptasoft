// src/presentation/pages/AdminDashboardPage.jsx
import { useState, useEffect } from "react";
import { Users, Stethoscope, BarChart3, UserRound, Activity, ShieldCheck, UserPlus } from "lucide-react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { LoadingState } from "../components/ui/LoadingState";
import { StatCard } from "../components/ui/StatCard";
import { QuickAccessCard } from "../components/ui/QuickAccessCard";
import { ProfileSection } from "../components/sections/ProfileSection";
import { CreateUserForm } from "../components/forms/CreateUserForm";
import { VeterinariansSection } from "../components/sections/VeterinariansSection";
import { ReportsSection } from "../components/sections/ReportsSection";
import { ADMIN_NAV } from "../../shared/constants/navigation";
import { ROLES } from "../../domain/entities/User";
import { Veterinarian } from "../../domain/entities/Veterinarian";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { vetRepository } from "../../infrastructure/repositories/vetRepository";
import { petRepository } from "../../infrastructure/repositories/petRepository";
import { appointmentRepository } from "../../infrastructure/repositories/appointmentRepository";

function formatToday() {
  const str = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function AdminDashboardPage({ onLogout, currentUser }) {
  const [activeNav, setActiveNav] = useState("inicio");
  const [users, setUsers] = useState([]);
  const [vets, setVets] = useState([]);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true); setLoadError(null);
      try {
        const [usersData, vetsData, petsData, appointmentsData] = await Promise.all([userRepository.list(), vetRepository.list(), petRepository.list(), appointmentRepository.list()]);
        if (cancelled) return;
        setUsers(usersData);
        setVets(vetsData.map((v) => new Veterinarian(v)));
        setPets(petsData);
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

  async function handleCreateVet(formData) {
    const newVet = await vetRepository.create(formData);
    setVets((prev) => [new Veterinarian(newVet), ...prev]);
  }

  const ownersCount = users.filter((u) => u.role === ROLES.OWNER).length;
  const firstName = (currentUser?.name || "").split(" ")[0] || "";

  function renderSection() {
    switch (activeNav) {
      case "usuarios":
        return (
          <>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold text-text-dark">Usuarios</h1>
                <p className="text-sm text-text-muted">Gestión de todos los usuarios del sistema</p>
              </div>
            </div>
            <CreateUserForm initialUsers={users} currentUserId={currentUser.id} />
          </>
        );
      case "veterinarios":
        return <VeterinariansSection vets={vets} onCreateVet={handleCreateVet} />;
      case "reportes":
        return <ReportsSection pets={pets} appointments={appointments} vets={vets} />;
      case "perfil":
        return <ProfileSection user={currentUser} />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout subtitle="Panel de Administración" roleLabel="Administrador" roleIcon="🛡️" photoUrl={currentUser?.photoUrl}
        navItems={ADMIN_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout subtitle="Panel de Administración" roleLabel="Administrador" roleIcon="🛡️" photoUrl={currentUser?.photoUrl}
      navItems={ADMIN_NAV} activeNav={activeNav} onNavigate={setActiveNav} onLogout={onLogout}>
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
                  Panel de Administración {firstName && `— ${firstName}`} <span aria-hidden>🛡️</span>
                </h1>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  Gestión global del sistema: usuarios, veterinarios y reportes.
                </p>
              </div>
              <button
                onClick={() => setActiveNav("usuarios")}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                <UserPlus className="h-4 w-4" strokeWidth={2.5} />
                Gestionar Usuarios
              </button>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Users} value={users.length} label="Usuarios Totales" accent="orange" />
            <StatCard icon={Stethoscope} value={vets.length} label="Veterinarios" accent="yellow" />
            <StatCard icon={UserRound} value={ownersCount} label="Dueños" accent="green" />
            <StatCard icon={Activity} value="98%" label="Uptime" accent="blue" />
          </div>

          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted">
            <span className="h-px flex-1 bg-border" />
            PANEL DE ADMINISTRACIÓN
            <span className="h-px flex-1 bg-border" />
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickAccessCard icon={<Users className="h-5 w-5" strokeWidth={2.25} />} title="Gestión de Usuarios" description="Crear, editar, suspender" highlighted onClick={() => setActiveNav("usuarios")} />
            <QuickAccessCard icon={<Stethoscope className="h-5 w-5" strokeWidth={2.25} />} title="Veterinarios" description="Gestionar especialistas" onClick={() => setActiveNav("veterinarios")} />
            <QuickAccessCard icon={<BarChart3 className="h-5 w-5" strokeWidth={2.25} />} title="Reportes Globales" description="Estadísticas del sistema" onClick={() => setActiveNav("reportes")} />
          </div>
        </>
      )}
      {renderSection()}
    </DashboardLayout>
  );
}
