// src/presentation/components/ui/StatCard.jsx
import { useEffect, useRef, useState } from "react";

const ACCENTS = {
  orange: { border: "border-t-primary", text: "text-primary", ring: "bg-primary/10 text-primary" },
  yellow: { border: "border-t-yellow-400", text: "text-yellow-500", ring: "bg-yellow-100 text-yellow-600" },
  green: { border: "border-t-green-500", text: "text-green-600", ring: "bg-green-100 text-green-600" },
  blue: { border: "border-t-blue-500", text: "text-blue-600", ring: "bg-blue-100 text-blue-600" },
};

// Anima un valor de 0 hasta su número real. Soporta strings tipo "98%".
function useCountUp(rawValue, duration = 900) {
  const match = typeof rawValue === "string" ? rawValue.match(/^(-?\d+(?:\.\d+)?)(.*)$/) : null;
  const numeric = typeof rawValue === "number" ? rawValue : match ? parseFloat(match[1]) : null;
  const suffix = typeof rawValue === "string" && match ? match[2] : "";
  const [display, setDisplay] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    if (numeric === null) return;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [numeric, duration]);

  if (numeric === null) return rawValue;
  return `${display}${suffix}`;
}

export function StatCard({ value, label, accent = "orange", icon: Icon }) {
  const style = ACCENTS[accent] || ACCENTS.orange;
  const displayValue = useCountUp(value);
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border-t-4 bg-white px-4 py-6 shadow-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-card-hover ${style.border}`}>
      {Icon && (
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.ring}`}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
      )}
      <span className={`text-3xl font-extrabold tabular-nums ${style.text}`}>{displayValue}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}
