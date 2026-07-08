import React from "react";

export default function StatCard({ label, value, accent = "amber" }) {
  const accentClass =
    accent === "teal" ? "text-teal" : accent === "coral" ? "text-coral" : "text-amber";

  return (
    <div className="rounded-2xl border border-inkline bg-inkline/40 p-5">
      <p className="text-xs uppercase tracking-widest text-slate mb-2">{label}</p>
      <p className={`font-mono text-3xl font-medium ${accentClass}`}>{value}</p>
    </div>
  );
}
