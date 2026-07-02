// src/presentation/pages/LoginPage.jsx
import { useState } from "react";
import { ShieldCheck, HeartHandshake, Clock3 } from "lucide-react";
import { LoginForm } from "../components/forms/LoginForm";
import { RegisterForm } from "../components/forms/RegisterForm";
import logo from "../../assets/logo.jpeg";

const PAW_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='%23D9711A'%3E%3Cellipse cx='50' cy='66' rx='16' ry='12'/%3E%3Ccircle cx='30' cy='38' r='7'/%3E%3Ccircle cx='46' cy='24' r='7'/%3E%3Ccircle cx='64' cy='24' r='7'/%3E%3Ccircle cx='80' cy='38' r='7'/%3E%3C/g%3E%3C/svg%3E")`;

export function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-warm-bg px-6 py-6 md:px-16">
      {/* Patrón de patitas en diagonal, muy sutil, detrás de todo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: PAW_PATTERN,
          backgroundSize: "110px 110px",
          transform: "rotate(18deg) scale(1.6)",
          transformOrigin: "center",
        }}
      />

      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-float-slow rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 animate-float-slower rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute left-6 top-4 flex items-center gap-2 md:left-16 md:top-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg">
          🐾
        </div>
        <span className="text-lg font-bold text-text-dark">
          Adopta<span className="text-primary">soft</span>
        </span>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center gap-8 py-16 md:flex-row md:justify-between md:py-0">
        {/* Izquierda */}
        <div className="mx-auto hidden max-w-2xl flex-1 flex-col items-center text-center md:flex">
          {/* Círculo del logo con aro naranja */}
          <div
            className="rounded-full bg-gradient-to-br from-primary to-primary-dark p-2 shadow-soft-lg"
            style={{ width: "clamp(228px, 29vw, 392px)", height: "clamp(228px, 29vw, 392px)" }}
          >
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white">
              <img
                src={logo}
                alt="Adoptasoft"
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            </div>
          </div>

          <h2
            className="mt-4 font-extrabold leading-[1.1] text-text-dark"
            style={{ fontSize: "clamp(2rem, 3.2vw, 3rem)" }}
          >
            Encuentra a tu nuevo{" "}
            <span className="text-primary">mejor amigo.</span>
          </h2>
          <p
            className="mt-4 max-w-xl text-text-muted"
            style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.125rem)" }}
          >
            La plataforma todo-en-uno para el cuidado de mascotas: agenda citas
            en segundos, lleva el historial clínico al día y mantente conectado
            con tu veterinario de confianza.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock3 className="h-4 w-4" strokeWidth={2.25} />
              </span>
              Citas en segundos
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartHandshake className="h-4 w-4" strokeWidth={2.25} />
              </span>
              Cuidado cercano
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
              </span>
              Datos seguros
            </div>
          </div>
        </div>

        {/* Derecha: tarjeta de login */}
        <div key={mode} className="w-full max-w-md flex-shrink-0 animate-fade-in-up md:ml-auto">
          {mode === "login" ? (
            <LoginForm onLoginSuccess={onLoginSuccess} onGoToRegister={() => setMode("register")} />
          ) : (
            <RegisterForm onRegisterSuccess={onLoginSuccess} onBackToLogin={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
