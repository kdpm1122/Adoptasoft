// src/presentation/components/ui/Button.jsx

export function Button({ children, variant = "primary", isLoading, ...props }) {
  const base = "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-soft disabled:active:scale-100";

  const variants = {
    primary: "bg-primary text-white shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg hover:bg-primary-dark active:translate-y-0 active:shadow-soft",
    secondary: "border border-border bg-warm-cream text-text-dark shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light active:translate-y-0",
  };

  return (
    <button {...props} disabled={isLoading || props.disabled} className={`${base} ${variants[variant]}`}>
      {isLoading ? "Cargando..." : children}
    </button>
  );
}
