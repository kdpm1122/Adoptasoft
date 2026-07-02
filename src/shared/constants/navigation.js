// src/shared/constants/navigation.js
import { Home, PawPrint, ClipboardList, NotebookText, MessageCircle, User, CalendarDays, Users, Stethoscope } from "lucide-react";

export const OWNER_NAV = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "mascotas", label: "Mis Mascotas", icon: PawPrint },
  { key: "citas", label: "Citas", icon: ClipboardList },
  { key: "historial", label: "Historial", icon: NotebookText },
  { key: "mensajes", label: "Mensajes", icon: MessageCircle },
  { key: "perfil", label: "Mi Perfil", icon: User },
];

export const VET_NAV = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "agenda", label: "Mi Agenda", icon: CalendarDays },
  { key: "pacientes", label: "Pacientes", icon: PawPrint },
  { key: "registrar", label: "Registrar Consulta", icon: ClipboardList },
  { key: "mensajes", label: "Mensajes", icon: MessageCircle },
  { key: "perfil", label: "Mi Perfil", icon: User },
];

export const ADMIN_NAV = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "veterinarios", label: "Veterinarios", icon: Stethoscope },
  { key: "perfil", label: "Mi Perfil", icon: User },
];
