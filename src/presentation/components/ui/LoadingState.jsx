// src/presentation/components/ui/LoadingState.jsx
export function LoadingState({ label = "Cargando datos..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex gap-2">
        <span className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-primary" />
      </div>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
