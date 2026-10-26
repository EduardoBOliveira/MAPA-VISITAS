import { Maximize2, Minimize2, Moon, SlidersHorizontal, Sun, Radar, Database, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PeriodPreset } from "@/types/visit";
import type { ReactNode } from "react";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Mês atual" },
  { value: "year", label: "Ano atual" },
  { value: "all", label: "Todo o período" },
];

interface Props {
  source: "mock" | "api";
  preset: PeriodPreset;
  onPreset(p: PeriodPreset): void;
  activeFilters: number;
  onToggleFilters(): void;
  onToggleInsights(): void;
  theme: "dark" | "light";
  onToggleTheme(): void;
  fullscreen: boolean;
  onToggleFullscreen(): void;
  extra?: ReactNode;
}

function IconBtn({ label, onClick, children, active }: { label: string; onClick(): void; children: ReactNode; active?: boolean | undefined }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={active ? "secondary" : "ghost"} size="icon" onClick={onClick} aria-label={label} className="relative">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppHeader(p: Props) {
  return (
    <header className="glass relative z-20 flex h-14 shrink-0 items-center gap-3 rounded-xl px-3 md:px-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="glow-ring flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Radar className="size-4 text-cyan" />
        </div>
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-sm font-semibold tracking-wide md:text-base">
            FESA <span className="text-gradient">GEO INTELLIGENCE</span>
          </h1>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">Inteligência Geográfica de Visitas Comerciais</p>
        </div>
      </div>

      <div className="ml-2 hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground md:flex">
        <span className="pulse-dot size-1.5 rounded-full bg-success" />
        <Database className="size-3" />
        {p.source === "mock" ? "Dados de demonstração" : "API conectada"}
      </div>

      <div className="ml-auto flex items-center gap-1">
        {p.extra}
        <Select value={PRESETS.some((x) => x.value === p.preset) ? p.preset : ""} onValueChange={(v) => p.onPreset(v as PeriodPreset)}>
          <SelectTrigger className="h-9 w-[150px] bg-transparent text-xs" aria-label="Período">
            <SelectValue placeholder="Período personalizado" />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((x) => (
              <SelectItem key={x.value} value={x.value} className="text-xs">
                {x.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <IconBtn label="Filtros" onClick={p.onToggleFilters}>
          <SlidersHorizontal />
          {p.activeFilters > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] text-primary-foreground">
              {p.activeFilters}
            </span>
          )}
        </IconBtn>
        <IconBtn label="Painel de inteligência" onClick={p.onToggleInsights}>
          <PanelRight />
        </IconBtn>
        <IconBtn label={p.theme === "dark" ? "Tema claro" : "Tema escuro"} onClick={p.onToggleTheme}>
          {p.theme === "dark" ? <Sun /> : <Moon />}
        </IconBtn>
        <IconBtn label={p.fullscreen ? "Sair da tela cheia" : "Tela cheia"} onClick={p.onToggleFullscreen}>
          {p.fullscreen ? <Minimize2 /> : <Maximize2 />}
        </IconBtn>
      </div>
    </header>
  );
}
