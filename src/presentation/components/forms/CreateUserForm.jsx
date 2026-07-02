// src/presentation/components/forms/CreateUserForm.jsx
import { useState } from "react";
import { userRepository } from "../../../infrastructure/repositories/userRepository";
import { useUserManagement } from "../../../application/hooks/useUserManagement";
import { ROLES } from "../../../domain/entities/User";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import { UserListItem } from "../ui/UserListItem";

export function CreateUserForm({ initialUsers, currentUserId }) {
  const { users, formData, setField, errors, isLoading, createUser, deleteUser, updateUser } = useUserManagement(initialUsers);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    await createUser();
  }

  async function handleUpdate(id, payload) {
    return updateUser(id, payload);
  }

  async function handleResetPassword(id, newPassword) {
    return userRepository.adminResetPassword(id, newPassword);
  }

  async function handleDelete(id) {
    setDeleteError(null);
    try {
      await deleteUser(id);
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return u.name?.toLowerCase().includes(term) || u.subtitle?.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-text-dark">+ Crear Nuevo Usuario</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField label="NOMBRE COMPLETO *" placeholder="Nombre" value={formData.fullName} onChange={(e) => setField("fullName", e.target.value)} error={errors.fullName} />
          <TextField label="CORREO *" placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => setField("email", e.target.value)} error={errors.email} />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wide text-text-dark">ROL *</label>
            <select value={formData.role} onChange={(e) => setField("role", e.target.value)}
              className="rounded-xl border border-border bg-warm-cream px-4 py-3 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light">
              <option value="">Seleccionar</option>
              <option value={ROLES.OWNER}>Dueño</option>
              <option value={ROLES.VET}>Veterinario</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
            {errors.role && <span className="text-xs text-red-500">{errors.role}</span>}
          </div>
          <TextField label="TELÉFONO" placeholder="+57 300 000 0000" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} />
          <TextField label="DOCUMENTO" placeholder="CC o NIT" value={formData.document} onChange={(e) => setField("document", e.target.value)} />
          <TextField label="CONTRASEÑA *" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setField("password", e.target.value)} error={errors.password} />
          <div className="flex items-end">
            <Button type="submit" isLoading={isLoading}>+ Crear Usuario</Button>
          </div>
        </div>
      </form>
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-wide text-text-muted">USUARIOS REGISTRADOS</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-64 rounded-lg border border-border bg-warm-cream px-3 py-2 text-xs text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
        {deleteError && <p className="mb-2 text-xs text-red-500">{deleteError}</p>}
        <div className="flex flex-col gap-3">
          {filteredUsers.length === 0 && (
            <p className="text-xs text-text-muted">No se encontraron usuarios.</p>
          )}
          {filteredUsers.map((u, i) => (
            <div key={u.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 90, 450)}ms` }}>
              <UserListItem
                icon={u.role === "veterinario" ? "🩺" : "👤"}
                name={u.name}
                subtitle={u.subtitle}
                role={u.role}
                email={u.email}
                document={u.document}
                phone={u.phone}
                onUpdate={(payload) => handleUpdate(u.id, payload)}
                onResetPassword={(newPassword) => handleResetPassword(u.id, newPassword)}
                onDelete={() => handleDelete(u.id)}
                disableDelete={String(u.id) === String(currentUserId)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
