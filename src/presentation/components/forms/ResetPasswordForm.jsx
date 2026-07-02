// src/presentation/components/forms/ResetPasswordForm.jsx
import { useState } from "react";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";

export function ResetPasswordForm({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    try {
      await authRepository.resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
        <h1 className="font-display text-2xl font-semibold text-text-dark">Contraseña actualizada</h1>
        <p className="text-sm text-text-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Button type="button" onClick={onDone}>Ir a iniciar sesión</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-dark">Crea una nueva contraseña</h1>
        <p className="mt-1 text-sm text-text-muted">Escribe y confirma tu nueva contraseña.</p>
      </div>

      <TextField
        label="NUEVA CONTRASEÑA"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <TextField
        label="CONFIRMAR CONTRASEÑA"
        type="password"
        placeholder="Repite la contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={error}
      />

      <Button type="submit" isLoading={isLoading}>
        Cambiar contraseña
      </Button>
    </form>
  );
}
