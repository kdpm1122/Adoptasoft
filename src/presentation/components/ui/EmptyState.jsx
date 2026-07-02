// src/presentation/components/ui/EmptyState.jsx
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-warm-cream/40 px-4 py-12 text-center animate-fade-in">
      {Icon && (
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
      )}
      <p className="font-semibold text-text-dark">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-muted">{description}</p>}
    </div>
  );
}
