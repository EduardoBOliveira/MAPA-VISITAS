import { motion } from "framer-motion";
import { ArrowLeft, Building2, CalendarDays, List, MapPin, Users, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Visit } from "@/types/visit";
import {
  aggregateByCity,
  computeKpis,
  sortByDateDesc,
  type CityAgg,
  type StateAgg,
} from "@/utils/aggregations";
import { fmtDate, fmtNum, fmtPct } from "@/utils/format";
import { ufName } from "@/utils/geo";
import { StatusBadge } from "@/components/visits/StatusBadge";

interface Props {
  scopeVisits: Visit[];
  allFiltered: Visit[];
  states: Map<string, StateAgg>;
  cities: CityAgg[];
  selectedUf?: string | undefined;
  selectedCity?: CityAgg | undefined;
  onSelectState(uf: string): void;
  onSelectCity(key: string): void;
  onBackToBrazil(): void;
  onBackToState(): void;
  onOpenTable(): void;
}

function Bar({
  label,
  value,
  max,
  hint,
  onClick,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string | undefined;
  onClick?(): void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="truncate">{label}</span>
        <span className="ml-2 shrink-0 font-mono text-muted-foreground">
          {fmtNum(value)}
          {hint && <span className="ml-1.5 text-[10px] opacity-70">{hint}</span>}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${max ? (value / max) * 100 : 0}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
        />
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-surface-2/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-semibold tabular-nums">{fmtNum(value)}</div>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="label-xs">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function VisitRow({ v }: { v: Visit }) {
  return (
    <div className="rounded-md border px-3 py-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{v.accountName}</span>
        <StatusBadge status={v.status} />
      </div>
      <div className="mt-1 flex justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">
          {v.responsibleName ?? "—"} · {v.activityCategory ?? "—"}
        </span>
        <span className="shrink-0 font-mono">{fmtDate(v.date)}</span>
      </div>
    </div>
  );
}

export function InsightPanel(p: Props) {
  const k = computeKpis(p.scopeVisits);
  const commercialRanking = [
    ...p.scopeVisits
      .reduce((acc, visit) => {
        const location = visit.location?.trim();

        if (!location || ["20", "BRASIL", "ESTADOS UNIDOS"].includes(location.toUpperCase())) {
          return acc;
        }

        acc.set(location, (acc.get(location) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
      .entries(),
  ]
    .map(([location, total]) => ({ location, total }))
    .sort((a, b) => b.total - a.total);
  const tableBtn = (
    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={p.onOpenTable}>
      <List className="size-3" /> Ver todas
    </Button>
  );

  let body: React.ReactNode;
  let header: React.ReactNode;

  if (p.selectedCity) {
    const c = p.selectedCity;
    const recent = sortByDateDesc(p.scopeVisits);
    header = (
      <>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={p.onBackToState}>
            <ArrowLeft /> {ufName(c.uf)}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={p.onBackToBrazil}>
            <Globe2 /> Brasil
          </Button>
        </div>
        <h2 className="mt-2 text-lg font-semibold">{c.city}</h2>
        <p className="text-xs text-muted-foreground">
          {ufName(c.uf)} · {c.uf} · última visita {fmtDate(c.lastDate)}
        </p>
      </>
    );
    body = (
      <>
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={CalendarDays} label="Visitas" value={k.total} />
          <Stat icon={Building2} label="Clientes" value={k.clients} />
          <Stat icon={Users} label="Resp." value={k.responsibles} />
        </div>
        {!c.coord && (
          <p className="rounded-md border border-warning/40 px-3 py-2 text-[11px] text-warning">
            Cidade sem coordenadas de referência — não posicionada no mapa.
          </p>
        )}
        <Section title="Visitas mais recentes" action={tableBtn}>
          <div className="space-y-1.5">
            {recent.slice(0, 12).map((v) => (
              <VisitRow key={v.id} v={v} />
            ))}
          </div>
        </Section>
      </>
    );
  } else if (p.selectedUf) {
    const uf = p.selectedUf;
    const cities = aggregateByCity(p.scopeVisits);
    const max = commercialRanking[0]?.total ?? 0;
    header = (
      <>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={p.onBackToBrazil}>
          <ArrowLeft /> Voltar para Brasil
        </Button>
        <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold">
          {ufName(uf)}{" "}
          <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-cyan">{uf}</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          {fmtPct(p.states.get(uf)?.share ?? 0)} das visitas filtradas
        </p>
      </>
    );
    body = (
      <>
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={CalendarDays} label="Visitas" value={k.total} />
          <Stat icon={Building2} label="Clientes" value={k.clients} />
          <Stat icon={MapPin} label="Cidades" value={k.cities} />
          <Stat icon={Users} label="Responsáveis" value={k.responsibles} />
        </div>
        <Section title="Ranking de localizações comerciais">
          {commercialRanking.length ? (
            <div>
              {commercialRanking.map((item) => (
                <Bar key={item.location} label={item.location} value={item.total} max={max} />
              ))}
            </div>
          ) : (
            <Empty text="Nenhuma localização comercial encontrada para os filtros atuais." />
          )}
        </Section>
        <Section title="Visitas recentes" action={tableBtn}>
          <div className="space-y-1.5">
            {sortByDateDesc(p.scopeVisits)
              .slice(0, 6)
              .map((v) => (
                <VisitRow key={v.id} v={v} />
              ))}
          </div>
        </Section>
      </>
    );
  } else {
    const ranking = [...p.states.values()]
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total);
    const max = ranking[0]?.total ?? 0;
    const topLocations = commercialRanking.slice(0, 5);
    header = (
      <>
        <div className="label-xs">Visão nacional</div>
        <h2 className="mt-1 text-lg font-semibold">Brasil</h2>
        <p className="text-xs text-muted-foreground">
          Cobertura: {k.states} de 27 UFs · {fmtNum(k.cities)} cidades
        </p>
      </>
    );
    body = (
      <>
        <Section title="Cobertura geográfica">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success"
              style={{ width: `${(k.states / 27) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {27 - k.states} UFs sem visitas no período
          </p>
        </Section>
        <Section title="Top 5 localizações comerciais">
          {topLocations.length ? (
            <div className="space-y-1">
              {topLocations.map((item, i) => (
                <div
                  key={item.location}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-1.5"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-accent font-mono text-[11px] text-cyan">
                    {i + 1}
                  </span>

                  <span className="flex-1 truncate text-xs">
                    {item.location}
                  </span>

                  <span className="font-mono text-xs">
                    {fmtNum(item.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Sem localizações comerciais para os filtros atuais." />
          )}
        </Section>
        <Section title="Ranking e distribuição por estado" action={tableBtn}>
          {ranking.length ? (
            <div>
              {ranking.map((s) => (
                <Bar
                  key={s.uf}
                  label={`${s.name}`}
                  value={s.total}
                  max={max}
                  hint={fmtPct(s.share)}
                  onClick={() => p.onSelectState(s.uf)}
                />
              ))}
            </div>
          ) : (
            <Empty text="Nenhuma visita encontrada." />
          )}
        </Section>
      </>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">{header}</div>
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-4 py-4">{body}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
