// src/presentation/components/forms/RegisterForm.jsx
import { useState } from "react";
import { authRepository } from "../../../infrastructure/repositories/authRepository";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";

const initialForm = { fullName: "", email: "", phone: "", document: "", password: "", confirmPassword: "" };

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "El nombre es obligatorio.";
  if (!form.email.trim()) errors.email = "El correo es obligatorio.";
  if (!form.password || form.password.length < 6) errors.password = "Mínimo 6 caracteres.";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Las contraseñas no coinciden.";
  return errors;
}

export function RegisterForm({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  function setField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setApiError(null);
    try {
      const user = await authRepository.register(formData);
      onRegisterSuccess?.(user);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
      <div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-text-dark">
          Crear cuenta en <span className="text-primary">Adoptasoft</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">Este registro es para perfil de Dueño 🐶.</p>
      </div>

      <TextField
        label="NOMBRE COMPLETO"
        placeholder="Tu nombre"
        value={formData.fullName}
        onChange={(e) => setField("fullName", e.target.value)}
        error={errors.fullName}
      />

      <TextField
        label="CORREO ELECTRÓNICO"
        placeholder="correo@ejemplo.com"
        value={formData.email}
        onChange={(e) => setField("email", e.target.value)}
        error={errors.email}
      />

      <TextField
        label="TELÉFONO"
        placeholder="+57 300 000 0000"
        value={formData.phone}
        onChange={(e) => setField("phone", e.target.value)}
      />

      <TextField
        label="DOCUMENTO"
        placeholder="CC o NIT"
        value={formData.document}
        onChange={(e) => setField("document", e.target.value)}
      />

      <TextField
        label="CONTRASEÑA"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={formData.password}
        onChange={(e) => setField("password", e.target.value)}
        error={errors.password}
      />

      <TextField
        label="CONFIRMAR CONTRASEÑA"
        type="password"
        placeholder="Repite tu contraseña"
        value={formData.confirmPassword}
        onChange={(e) => setField("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />

      {apiError && <p className="text-sm text-red-500">{apiError}</p>}

      <Button type="submit" isLoading={isLoading}>
        Crear cuenta
      </Button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="text-center text-sm font-semibold text-primary hover:underline"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </form>
  );
}
