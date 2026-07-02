// src/presentation/components/sections/ProfileSection.jsx
import { useRef, useState } from "react";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { validateChangePasswordForm } from "../../../domain/services/userValidation";
import { userRepository } from "../../../infrastructure/repositories/userRepository";
import { resizeImageToBase64 } from "../../../shared/utils/imageResize";

export function ProfileSection({ user, onPhotoChange }) {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function setField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccessMsg(""); setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg(""); setErrorMsg("");
    const { isValid, errors: validationErrors } = validateChangePasswordForm(formData);
    setErrors(validationErrors);
    if (!isValid) return;
    setIsLoading(true);
    try {
      await userRepository.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      setSuccessMsg("✅ Contraseña actualizada correctamente.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      setErrorMsg(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setPhotoError(null);
    try {
      const base64 = await resizeImageToBase64(file);
      await userRepository.updatePhoto(base64);
      onPhotoChange?.(base64);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  const ROLE_LABELS = { dueño: "Dueño", veterinario: "Veterinario", admin: "Administrador" };
  const ROLE_ICONS  = { dueño: "🐶", veterinario: "🩺", admin: "🛡️" };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-text-dark">👤 Mi Perfil</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={isUploading}
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl hover:ring-2 hover:ring-primary-light"
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                ROLE_ICONS[user?.role] || "👤"
              )}
              {isUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white">
                  ...
                </span>
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                  {user?.photoUrl && (
                    <button
                      type="button"
                      onClick={() => { setLightboxOpen(true); setMenuOpen(false); }}
                      className="block w-full px-3 py-2 text-left text-xs text-text-dark hover:bg-warm-cream"
                    >
                      👁️ Ver foto
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
                    className="block w-full px-3 py-2 text-left text-xs text-text-dark hover:bg-warm-cream"
                  >
                    📷 Cambiar foto
                  </button>
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-lg font-bold text-text-dark">{user?.name || "Usuario"}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            {photoError && <p className="mt-1 text-[10px] text-red-500">{photoError}</p>}
          </div>
        </div>

        {lightboxOpen && user?.photoUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <img
              src={user.photoUrl}
              alt={user?.name}
              className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-text-dark"
            >
              ✕ Cerrar
            </button>
          </div>
        )}
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-semibold text-text-dark">🔒 Cambiar Contraseña</h3>
        <p className="mb-5 text-sm text-text-muted">Ingresa tu contraseña actual y define una nueva.</p>
        {successMsg && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMsg}</div>}
        {errorMsg   && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:max-w-sm">
          <TextField label="CONTRASEÑA ACTUAL *" type="password" placeholder="Tu contraseña actual"
            value={formData.currentPassword} onChange={(e) => setField("currentPassword", e.target.value)} error={errors.currentPassword} />
          <TextField label="NUEVA CONTRASEÑA *" type="password" placeholder="Mínimo 6 caracteres"
            value={formData.newPassword} onChange={(e) => setField("newPassword", e.target.value)} error={errors.newPassword} />
          <TextField label="CONFIRMAR CONTRASEÑA *" type="password" placeholder="Repite la nueva contraseña"
            value={formData.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} error={errors.confirmPassword} />
          <div><Button type="submit" isLoading={isLoading}>💾 Guardar Contraseña</Button></div>
        </form>
      </div>
    </div>
  );
}
