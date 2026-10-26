import type { PeriodPreset, Visit, VisitFilters } from "@/types/visit";
import { normalize, resolveUF, visitCityKey } from "./geo";

export const emptyFilters = (): VisitFilters => ({
  states: [],
  cities: [],
  commercialRegions: [],
  commercialLocations: [],
  responsibles: [],
  accounts: [],
  categories: [],
  statuses: [],
});

export const accountKey = (v: Visit) => v.accountId ?? `name:${normalize(v.accountName)}`;
export const dateOnly = (iso: string) => iso.slice(0, 10);

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function presetRange(p: PeriodPreset, today = new Date()): { from?: string; to?: string } {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  switch (p) {
    case "7d":
      return { from: iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 6)), to: iso(t) };
    case "30d":
      return { from: iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 29)), to: iso(t) };
    case "month":
      return { from: iso(new Date(t.getFullYear(), t.getMonth(), 1)), to: iso(t) };
    case "year":
      return { from: iso(new Date(t.getFullYear(), 0, 1)), to: iso(t) };
    default:
      return {};
  }
}

export function detectPreset(f: Pick<VisitFilters, "from" | "to">): PeriodPreset {
  if (!f.from && !f.to) return "all";
  for (const p of ["7d", "30d", "month", "year"] as const) {
    const r = presetRange(p);
    if (r.from === f.from && r.to === f.to) return p;
  }
  return "custom";
}


/** Applies all filters combined (AND across fields, OR within a field). */
export function applyFilters(
  visits: Visit[],
  f: VisitFilters,
  opts: { ignoreDates?: boolean } = {}
): Visit[] {
  const states = new Set(f.states);
  const cities = new Set(f.cities);
  const commercialRegions = new Set(f.commercialRegions);
  const commercialLocations = new Set(f.commercialLocations);
  const resp = new Set(f.responsibles);
  const accs = new Set(f.accounts);
  const cats = new Set(f.categories);
  const sts = new Set(f.statuses);

  return visits.filter((v) => {
    const d = dateOnly(v.date);

    if (!opts.ignoreDates) {
      if (f.from && d < f.from) return false;
      if (f.to && d > f.to) return false;
    }

    if (states.size && !states.has(resolveUF(v.state) ?? "")) return false;
    if (cities.size && !cities.has(visitCityKey(v) ?? "")) return false;

    // Filtros comerciais da FESA
    if (
      commercialRegions.size &&
      !commercialRegions.has(v.commercialRegion ?? "")
    ) return false;

    if (
      commercialLocations.size &&
      !commercialLocations.has(v.location ?? "")
    ) return false;

    if (resp.size && !resp.has(v.responsibleName ?? "")) return false;
    if (accs.size && !accs.has(accountKey(v))) return false;
    if (cats.size && !cats.has(v.activityCategory ?? "")) return false;
    if (sts.size && !sts.has(v.status ?? "")) return false;

    return true;
  });
}


export function countActiveFilters(f: VisitFilters): number {
  return (
    (f.from || f.to ? 1 : 0) +
    (f.states.length ? 1 : 0) +
    (f.cities.length ? 1 : 0) +
    (f.commercialRegions.length ? 1 : 0) +
    (f.commercialLocations.length ? 1 : 0) +
    (f.responsibles.length ? 1 : 0) +
    (f.accounts.length ? 1 : 0) +
    (f.categories.length ? 1 : 0) +
    (f.statuses.length ? 1 : 0)
  );
}

/** Previous window of identical length, for period-over-period comparison. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  const days = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  const pTo = new Date(a.getFullYear(), a.getMonth(), a.getDate() - 1);
  const pFrom = new Date(pTo.getFullYear(), pTo.getMonth(), pTo.getDate() - days + 1);
  return { from: iso(pFrom), to: iso(pTo) };
}
