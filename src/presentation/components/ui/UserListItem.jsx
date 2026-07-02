// src/presentation/components/ui/UserListItem.jsx
import { useState } from "react";

const ROLE_BADGE = {
  "dueño": "bg-orange-100 text-orange-700",
  veterinario: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

const ROLE_OPTIONS = [
  { value: "dueño", label: "Dueño" },
  { value: "veterinario", label: "Veterinario" },
  { value: "admin", label: "Admin" },
];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      {children}
    </div>
  );
}

export function UserListItem({ id, icon, name, subtitle, role, email, document, phone, onDelete, onUpdate, disableDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fullName: name || "",
    email: email || "",
    document: document || "",
    phone: phone || "",
    role: role || "dueño",
  });

  function handleDelete() {
    if (window.confirm(`¿Eliminar la cuenta de ${name}? Esta acción no se puede deshacer.`)) {
      onDelete?.();
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await onUpdate?.(form);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setForm({ fullName: name || "", email: email || "", document: document || "", phone: phone || "", role: role || "dueño" });
    setIsEditing(false);
    setError(null);
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-primary-light bg-warm-cream/50 px-4 py-3 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Field label="Nombre">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nombre" className="rounded-lg border border-border px-2 py-1 text-xs" />
          </Field>
          <Field label="Correo">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Correo" className="rounded-lg border border-border px-2 py-1 text-xs" />
          </Field>
          <Field label="Documento">
            <input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })}
              placeholder="Documento" className="rounded-lg border border-border px-2 py-1 text-xs" />
          </Field>
          <Field label="Teléfono">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono" className="rounded-lg border border-border px-2 py-1 text-xs" />
          </Field>
          <Field label="Rol">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border border-border px-2 py-1 text-xs">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={handleCancel} className="rounded-lg border border-border px-3 py-1 text-xs text-text-muted hover:bg-white">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving}
            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white shadow-soft hover:bg-primary-dark hover:shadow-soft-lg disabled:opacity-60">
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-cream text-lg">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-text-dark">{name}</p>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${ROLE_BADGE[role] || "bg-gray-100 text-gray-600"}`}>
          {role}
        </span>
        {onUpdate && (
          <button type="button" onClick={() => setIsEditing(true)} title="Editar usuario"
            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-text-dark hover:bg-warm-cream">
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={disableDelete}
            title={disableDelete ? "No puedes eliminar tu propio usuario" : "Eliminar usuario"}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
