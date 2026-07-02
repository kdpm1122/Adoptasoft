// src/presentation/components/ui/TimeSlot.jsx

export function TimeSlot({ time, isTaken, isSelected, onClick }) {
  return (
    <button
      type="button"
      disabled={isTaken}
      onClick={() => onClick(time)}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out
        ${isTaken ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed" : ""}
        ${!isTaken && isSelected ? "border-primary bg-primary text-white shadow-soft" : ""}
        ${!isTaken && !isSelected ? "border-border bg-white text-text-dark shadow-sm hover:-translate-y-0.5 hover:border-primary-light hover:shadow-card" : ""}
      `}
    >
      {time}
    </button>
  );
}
