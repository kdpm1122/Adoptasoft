// src/presentation/components/forms/LoginForm.jsx
import { useEffect, useRef } from "react";
import { PawPrint, Stethoscope, ShieldCheck } from "lucide-react";
import { useLogin } from "../../../application/hooks/useLogin";
import { ROLES } from "../../../domain/entities/User";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { RoleCard } from "../ui/RoleCard";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";

const GOOGLE_CLIENT_ID = "840053752885-ume640ihe181dnmj473vnbq8c0egks6o.apps.googleusercontent.com";

const ROLE_OPTIONS = [
  { value: ROLES.OWNER, label: "Dueño", icon: PawPrint },
  { value: ROLES.VET, label: "Veterinario", icon: Stethoscope },
  { value: ROLES.ADMIN, label: "Admin", icon: ShieldCheck },
];

export function LoginForm({ onLoginSuccess, onGoToRegister, onForgotPassword }) {
  const { formData, setField, errors, isLoading, apiError, submit } = useLogin();
  const googleButtonRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await submit();
    if (result.success) onLoginSuccess?.(result.user);
  }

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    function renderGoogleButton() {
      if (!window.google || !googleButtonRef.current) return false;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const user = await authRepository.loginWithGoogle(response.credential);
            onLoginSuccess?.(user);
          } catch (err) {
            console.error("Error al iniciar sesión con Google:", err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 380,
        text: "continue_with",
        locale: "es",
      });

      return true;
    }

    if (!renderGoogleButton() && !cancelled) {
      intervalId = setInterval(() => {
        if (renderGoogleButton() && intervalId) {
          clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [onLoginSuccess]);

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
      <div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-text-dark">
          Iniciar sesión en <span className="text-primary">Adoptasoft</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">Bienvenido de nuevo, ingresa tus datos.</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-text-muted">
          SELECCIONA TU PERFIL
        </p>
        <div className="flex gap-3">
          {ROLE_OPTIONS.map((opt) => (
            <RoleCard
              key={opt.value}
              icon={opt.icon}
              label={opt.label.toUpperCase()}
              isSelected={formData.role === opt.value}
              onClick={() => setField("role", opt.value)}
            />
          ))}
        </div>
        {errors.role && <span className="mt-1 text-xs text-red-500">{errors.role}</span>}
      </div>

      <TextField
        label="CORREO ELECTRÓNICO"
        placeholder="Correo electrónico o número de celular"
        value={formData.email}
        onChange={(e) => setField("email", e.target.value)}
        error={errors.email}
      />

      <TextField
        label="CONTRASEÑA"
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={(e) => setField("password", e.target.value)}
        error={errors.password}
      />

      {apiError && <p className="text-sm text-red-500">{apiError}</p>}

      <Button type="submit" isLoading={isLoading}>
        Iniciar sesión
      </Button>

      <button type="button" onClick={onForgotPassword} className="text-center text-sm font-medium text-primary hover:underline">
        ¿Olvidaste tu contraseña?
      </button>

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        o continúa con
        <span className="h-px flex-1 bg-border" />
      </div>

      <div ref={googleButtonRef} className="flex justify-center" />

      <button type="button" onClick={onGoToRegister} className="text-center text-sm font-semibold text-primary hover:underline">
        Crear cuenta nueva
      </button>
    </form>
  );
}
