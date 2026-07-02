// src/presentation/components/ui/RoleCard.jsx
import { CheckCircle2 } from "lucide-react";

export function RoleCard({ icon: Icon, label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all duration-200 ease-out
        ${isSelected
          ? "border-primary bg-primary/5 shadow-soft"
          : "border-border bg-white shadow-card hover:border-primary-light hover:-translate-y-0.5 hover:shadow-card-hover"
        }`}
    >
      {isSelected && (
        <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" strokeWidth={2.5} />
      )}
      <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="text-xs font-semibold tracking-wide text-text-dark">
        {label}
      </span>
    </button>
  );
}
