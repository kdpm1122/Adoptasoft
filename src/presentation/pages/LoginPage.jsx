// src/presentation/pages/LoginPage.jsx
import { useState } from "react";
import { LoginForm } from "../components/forms/LoginForm";
import { RegisterForm } from "../components/forms/RegisterForm";
import logo from "../../assets/logo.jpeg";

export function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <div className="flex min-h-screen w-full">
      {/* Panel izquierdo: ilustrativo */}
      <div className="hidden flex-1 flex-col bg-warm-bg px-12 py-6 md:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl">
            🐾
          </div>
          <span className="text-xl font-bold text-text-dark">
            Adopta<span className="text-primary">soft</span>
          </span>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-6">
          <img
            src={logo}
            alt="Adoptasoft"
            className="h-full max-h-full w-full max-w-xl object-contain"
            style={{
              mixBlendMode: "multiply",
              maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
            }}
          />
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight text-text-dark">
            Encuentra a tu nuevo{" "}
            <span className="text-primary">mejor amigo.</span>
          </h2>
          <p className="mt-4 max-w-md text-text-muted">
            Gestiona mascotas, citas e historiales clínicos en un solo lugar,
            pensado para dueños, veterinarios y administradores.
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10">
        {mode === "login" ? (
          <LoginForm onLoginSuccess={onLoginSuccess} onGoToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm onRegisterSuccess={onLoginSuccess} onBackToLogin={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
