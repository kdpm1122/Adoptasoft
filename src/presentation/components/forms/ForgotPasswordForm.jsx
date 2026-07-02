// src/presentation/components/forms/ForgotPasswordForm.jsx
import { useState } from "react";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";

export function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authRepository.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
        <h1 className="font-display text-2xl font-semibold text-text-dark">Revisa tu correo</h1>
        <p className="text-sm text-text-muted">
          Si el correo <strong>{email}</strong> está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.
        </p>
        <button type="button" onClick={onBackToLogin} className="text-center text-sm font-semibold text-primary hover:underline">
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-dark">¿Olvidaste tu contraseña?</h1>
        <p className="mt-1 text-sm text-text-muted">Escribe tu correo y te enviamos un enlace para recuperarla.</p>
      </div>

      <TextField
        label="CORREO ELECTRÓNICO"
        placeholder="tucorreo@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />

      <Button type="submit" isLoading={isLoading}>
        Enviar enlace de recuperación
      </Button>

      <button type="button" onClick={onBackToLogin} className="text-center text-sm font-semibold text-primary hover:underline">
        Volver a iniciar sesión
      </button>
    </form>
  );
}
