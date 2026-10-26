import type { Visit } from "@/types/visit";
import { resolveUF } from "./geo";

const esc = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Builds a CSV (semicolon separated, Excel pt-BR friendly) from visits. */
export function visitsToCsv(visits: Visit[]): string {
  const head = ["id", "data", "cliente", "id_cliente", "responsavel", "uf", "cidade", "categoria", "status", "latitude", "longitude"];
  const rows = visits.map((v) =>
    [v.id, v.date.slice(0, 10), v.accountName, v.accountId, v.responsibleName, resolveUF(v.state) ?? v.state, v.city, v.activityCategory, v.status, v.latitude, v.longitude]
      .map(esc)
      .join(";"),
  );
  return [head.join(";"), ...rows].join("\r\n");
}

export function downloadCsv(visits: Visit[], filename = "visitas.csv") {
  const blob = new Blob(["\ufeff" + visitsToCsv(visits)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
