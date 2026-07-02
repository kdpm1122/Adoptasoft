// src/presentation/components/ui/TextField.jsx
export function TextField({ label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide text-text-muted">
        {label}
      </label>
      <input
        {...inputProps}
        className={`rounded-lg border bg-white px-4 py-2.5 text-sm text-text-dark shadow-sm transition-colors duration-150
          placeholder:text-text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          ${error ? "border-red-400" : "border-border"}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
