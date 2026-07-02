// src/presentation/components/ui/UserListItem.jsx

const ROLE_BADGE = {
  "dueño": "bg-orange-100 text-orange-700",
  veterinario: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

export function UserListItem({ icon, name, subtitle, role, onDelete, disableDelete }) {
  function handleDelete() {
    if (window.confirm(`¿Eliminar la cuenta de ${name}? Esta acción no se puede deshacer.`)) {
      onDelete?.();
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
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
