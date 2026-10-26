import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PeriodPreset, Visit, VisitFilters } from "@/types/visit";
import {
  accountKey,
  countActiveFilters,
  detectPreset,
  emptyFilters,
  presetRange,
} from "@/utils/filters";
import { UF_LIST, resolveUF, visitCityKey } from "@/utils/geo";
import { MultiSelect, type Option } from "./MultiSelect";
import { cn } from "@/lib/utils";

const PRESETS: { v: PeriodPreset; l: string }[] = [
  { v: "7d", l: "7 dias" },
  { v: "30d", l: "30 dias" },
  { v: "month", l: "Mês atual" },
  { v: "year", l: "Ano atual" },
  { v: "all", l: "Tudo" },
];

function semesterRange(year: number, semester: 1 | 2) {
  return {
    from: `${year}-${semester === 1 ? "01" : "07"}-01`,
    to: `${year}-${semester === 1 ? "06-30" : "12-31"}`,
  };
}

interface Props {
  visits: Visit[];
  applied: VisitFilters;
  onApply(f: VisitFilters): void;
}

export function FilterPanel({ visits, applied, onApply }: Props) {
  const [draft, setDraft] = useState<VisitFilters>(applied);
  useEffect(() => setDraft(applied), [applied]);
  const set = <K extends keyof VisitFilters>(k: K, v: VisitFilters[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const opts = useMemo(() => {
    const states = new Map<string, number>();
    const commercialRegions = new Map<string, number>();
    const commercialLocations = new Map<string, number>();
    const cities = new Map<string, { label: string; uf: string; n: number }>();
    const resp = new Map<string, number>();
    const accs = new Map<string, { label: string; n: number }>();
    const cats = new Map<string, number>();
    const sts = new Map<string, number>();
    for (const v of visits) {
      const uf = resolveUF(v.state);
      if (v.commercialRegion) {
        commercialRegions.set(
          v.commercialRegion,
          (commercialRegions.get(v.commercialRegion) ?? 0) + 1,
        );
      }

      if (v.location) {
        commercialLocations.set(v.location, (commercialLocations.get(v.location) ?? 0) + 1);
      }
      if (uf) states.set(uf, (states.get(uf) ?? 0) + 1);
      const ck = visitCityKey(v);
      if (ck && uf) {
        const c = cities.get(ck) ?? { label: v.city!.trim(), uf, n: 0 };
        c.n++;
        cities.set(ck, c);
      }
      if (v.responsibleName) resp.set(v.responsibleName, (resp.get(v.responsibleName) ?? 0) + 1);
      const ak = accountKey(v);
      const a = accs.get(ak) ?? { label: v.accountName, n: 0 };
      a.n++;
      accs.set(ak, a);
      if (v.activityCategory) cats.set(v.activityCategory, (cats.get(v.activityCategory) ?? 0) + 1);
      if (v.status) sts.set(v.status, (sts.get(v.status) ?? 0) + 1);
    }
    const simple = (m: Map<string, number>): Option[] =>
      [...m.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, n]) => ({ value: k, label: k, hint: String(n) }));
    return {
      commercialRegions: simple(commercialRegions),
      commercialLocations: simple(commercialLocations),
      states: UF_LIST.filter((u) => states.has(u.uf)).map((u) => ({
        value: u.uf,
        label: u.name,
        hint: u.uf,
      })),
      cities: [...cities.entries()]
        .sort((a, b) => a[1].label.localeCompare(b[1].label))
        .map(([k, c]) => ({ value: k, label: c.label, hint: c.uf, uf: c.uf })),
      resp: simple(resp),
      accs: [...accs.entries()]
        .sort((a, b) => a[1].label.localeCompare(b[1].label))
        .map(([k, a]) => ({ value: k, label: a.label, hint: String(a.n) })),
      cats: simple(cats),
      sts: simple(sts),
    };
  }, [visits]);

  const cityOptions = draft.states.length
    ? opts.cities.filter((c) => draft.states.includes(c.uf))
    : opts.cities;
  const preset = detectPreset(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const active = countActiveFilters(applied);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Filtros</h2>
          {active > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
              {active} ativos
            </span>
          )}
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-2">
          <span className="label-xs">Período</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.v}
                onClick={() =>
                  setDraft((d) => ({ ...d, from: undefined, to: undefined, ...presetRange(p.v) }))
                }
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] transition-colors",
                  preset === p.v
                    ? "border-primary bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {p.l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] text-muted-foreground">Ano</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={draft.from ? Number(draft.from.slice(0, 4)) : ""}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  if (!year) return;

                  const currentSemester =
                    draft.from?.endsWith("-07-01") && draft.to?.endsWith("-12-31") ? 2 : 1;

                  setDraft((d) => ({
                    ...d,
                    ...semesterRange(year, currentSemester as 1 | 2),
                  }));
                }}
              >
                <option value="">Selecionar ano</option>
                {Array.from(
                  new Set([
                    new Date().getFullYear(),
                    ...visits.map((v) => Number(v.date.slice(0, 4))),
                  ]),
                )
                  .filter((year) => Number.isFinite(year) && year >= 2000)
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] text-muted-foreground">Semestre</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={
                  draft.from?.endsWith("-01-01") && draft.to?.endsWith("-06-30")
                    ? "1"
                    : draft.from?.endsWith("-07-01") && draft.to?.endsWith("-12-31")
                      ? "2"
                      : ""
                }
                onChange={(e) => {
                  const semester = Number(e.target.value) as 1 | 2;
                  if (semester !== 1 && semester !== 2) return;

                  const year = draft.from
                    ? Number(draft.from.slice(0, 4))
                    : new Date().getFullYear();

                  setDraft((d) => ({
                    ...d,
                    ...semesterRange(year, semester),
                  }));
                }}
              >
                <option value="">Selecionar semestre</option>
                <option value="1">1º semestre</option>
                <option value="2">2º semestre</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] text-muted-foreground">Data inicial</span>
              <Input
                type="date"
                value={draft.from ?? ""}
                max={draft.to}
                onChange={(e) => set("from", e.target.value || undefined)}
                className="h-9 bg-transparent text-xs"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] text-muted-foreground">Data final</span>
              <Input
                type="date"
                value={draft.to ?? ""}
                min={draft.from}
                onChange={(e) => set("to", e.target.value || undefined)}
                className="h-9 bg-transparent text-xs"
              />
            </label>
          </div>
        </section>

        <MultiSelect
          label="Região Comercial"
          options={opts.commercialRegions}
          value={draft.commercialRegions}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              commercialRegions: v,
              commercialLocations: d.commercialLocations.filter((loc) =>
                visits.some(
                  (visit) =>
                    visit.location === loc &&
                    (!v.length || v.includes(visit.commercialRegion ?? "")),
                ),
              ),
            }))
          }
          placeholder="Todas as regiões"
        />

        <MultiSelect
          label="Localização Comercial"
          options={
            draft.commercialRegions.length
              ? opts.commercialLocations.filter((loc) =>
                  visits.some(
                    (visit) =>
                      visit.location === loc.value &&
                      draft.commercialRegions.includes(visit.commercialRegion ?? ""),
                  ),
                )
              : opts.commercialLocations
          }
          value={draft.commercialLocations}
          onChange={(v) => set("commercialLocations", v)}
          placeholder="Todas as localizações"
        />

        <MultiSelect
          label="Estado"
          options={opts.states}
          value={draft.states}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              states: v,
              cities: v.length
                ? d.cities.filter((c) => v.includes(c.split("|")[0] ?? ""))
                : d.cities,
            }))
          }
        />
        <MultiSelect
          label="Cidade"
          options={cityOptions}
          value={draft.cities}
          onChange={(v) => set("cities", v)}
          placeholder={draft.states.length ? "Todas dos estados selecionados" : "Todas"}
        />
        <MultiSelect
          label="Responsável"
          options={opts.resp}
          value={draft.responsibles}
          onChange={(v) => set("responsibles", v)}
        />
        <MultiSelect
          label="Cliente"
          options={opts.accs}
          value={draft.accounts}
          onChange={(v) => set("accounts", v)}
        />
        <MultiSelect
          label="Categoria"
          options={opts.cats}
          value={draft.categories}
          onChange={(v) => set("categories", v)}
          placeholder="Todas"
        />
        <MultiSelect
          label="Status"
          options={opts.sts}
          value={draft.statuses}
          onChange={(v) => set("statuses", v)}
        />
      </div>

      <div className="flex gap-2 border-t p-3">
        <Button variant="ghost" className="flex-1" onClick={() => onApply(emptyFilters())}>
          <RotateCcw /> Limpar
        </Button>
        <Button className="flex-1" disabled={!dirty} onClick={() => onApply(draft)}>
          <Check /> Aplicar filtros
        </Button>
      </div>
    </div>
  );
}
