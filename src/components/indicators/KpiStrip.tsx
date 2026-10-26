import { motion } from "framer-motion";
import { Building2, CalendarCheck2, CheckCircle2, Map, MapPin, Users, TrendingDown, TrendingUp } from "lucide-react";
import type { Kpis } from "@/utils/aggregations";
import { fmtNum, fmtPct } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  kpis?: Kpis | undefined;
  previousTotal?: number | undefined | null;
}

export function KpiStrip({ kpis, previousTotal }: Props) {
  if (!kpis)
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-xl" />
        ))}
      </div>
    );

  const delta = previousTotal && previousTotal > 0 ? (kpis.total - previousTotal) / previousTotal : null;
  const items = [
    { label: "Total de visitas", value: kpis.total, icon: CalendarCheck2, sub: delta !== null ? { text: `${delta >= 0 ? "+" : ""}${fmtPct(delta)} vs. período anterior`, up: delta >= 0 } : null },
    { label: "Visitas realizadas", value: kpis.done, icon: CheckCircle2, sub: kpis.total ? { text: `${fmtPct(kpis.done / kpis.total)} do total`, up: true } : null },
    { label: "Clientes visitados", value: kpis.clients, icon: Building2, sub: null },
    { label: "Estados com visitas", value: kpis.states, icon: Map, sub: { text: `de 27 UFs`, neutral: true } },
    { label: "Cidades com visitas", value: kpis.cities, icon: MapPin, sub: null },
    { label: "Responsáveis ativos", value: kpis.responsibles, icon: Users, sub: null },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="glass group relative overflow-hidden rounded-xl px-4 py-3"
        >
          <div className="flex items-start justify-between">
            <span className="label-xs">{it.label}</span>
            <it.icon className="size-4 text-primary opacity-80" />
          </div>
          <motion.div key={it.value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {fmtNum(it.value)}
          </motion.div>
          {it.sub && (
            <div className={`mt-0.5 flex items-center gap-1 text-[11px] ${"neutral" in it.sub ? "text-muted-foreground" : it.sub.up ? "text-success" : "text-destructive"}`}>
              {!("neutral" in it.sub) && i === 0 && (it.sub.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />)}
              {it.sub.text}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
