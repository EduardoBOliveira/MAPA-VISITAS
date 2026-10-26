import { ShieldCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DataQuality } from "@/utils/aggregations";
import { fmtNum, fmtPct } from "@/utils/format";

export function DataQualityPopover({ q }: { q: DataQuality }) {
  const rows = [
    ["Total de registros", q.total],
    ["Com estado identificado", q.withState],
    ["Com cidade identificada", q.withCity],
    ["Com coordenadas válidas", q.withCoords],
    ["Sem localização suficiente", q.withoutLocation],
  ] as const;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="text-success" />
          <span className="hidden lg:inline">Qualidade</span>
          <span className="font-mono">{fmtPct(q.coverage, 0)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <h3 className="text-sm font-semibold">Qualidade dos dados</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Registros sem coordenadas entram nos indicadores, mas não aparecem como pontos no mapa. Nenhuma posição é inventada.
        </p>
        <div className="mt-3 space-y-1.5">
          {rows.map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-mono">{fmtNum(v)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="label-xs">Cobertura geográfica</span>
            <span className="font-mono text-success">{fmtPct(q.coverage)}</span>
          </div>
          <Progress value={q.coverage * 100} className="h-1.5" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
