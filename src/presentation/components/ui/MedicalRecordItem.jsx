// src/presentation/components/ui/MedicalRecordItem.jsx

const ACCENTS = {
  vacuna: "border-l-green-500",
  diagnostico: "border-l-blue-500",
  control: "border-l-orange-400",
};

const ICONS = { vacuna: "💉", diagnostico: "🩺", control: "🗒️" };

export function MedicalRecordItem({ record }) {
  return (
    <div className={`rounded-xl border-l-4 bg-white px-4 py-3 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover ${ACCENTS[record.type] || "border-l-gray-300"}`}>
      <p className="font-semibold text-text-dark">
        {ICONS[record.type] || "📋"} {record.title}
      </p>
      <p className="text-xs text-text-muted">
        {record.doctor} · {record.date}
        {record.nextDate ? ` · Próxima: ${record.nextDate}` : ""}
      </p>
      {record.detail && <p className="mt-1 text-xs text-text-muted">{record.detail}</p>}
    </div>
  );
}
