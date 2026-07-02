// src/presentation/components/ui/QuickAccessCard.jsx

export function QuickAccessCard({ icon, title, description, highlighted = false, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 ease-out hover:-translate-y-1
        ${highlighted
          ? "border-primary bg-primary text-white shadow-soft hover:shadow-soft-lg"
          : "border-border bg-white shadow-card hover:border-primary-light hover:shadow-card-hover"
        }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg
          ${highlighted ? "bg-white/20" : "bg-warm-cream"}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className={`text-xs ${highlighted ? "text-white/80" : "text-text-muted"}`}>{description}</p>
      </div>
      {badge && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}
