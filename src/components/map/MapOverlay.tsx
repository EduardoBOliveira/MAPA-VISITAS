import { ChevronRight, Flame, Hexagon, Home, Minus, Plus, CircleDot, Info } from "lucide-react";
import type { MapMode } from "@/types/visit";
import { MAP_PALETTES } from "./mapTheme";
import { fmtNum } from "@/utils/format";
import { cn } from "@/lib/utils";

const MODES: { v: MapMode; l: string; icon: typeof Flame }[] = [
  { v: "points", l: "Pontos", icon: CircleDot },
  { v: "choropleth", l: "Intensidade", icon: Hexagon },
  { v: "heat", l: "Concentração", icon: Flame },
];

export function ModeSwitch({ mode, onChange }: { mode: MapMode; onChange(m: MapMode): void }) {
  return (
    <div className="glass flex rounded-lg p-1" role="tablist" aria-label="Modo de visualização">
      {MODES.map((m) => (
        <button
          key={m.v}
          role="tab"
          aria-selected={mode === m.v}
          onClick={() => onChange(m.v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all",
            mode === m.v
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <m.icon className="size-3.5" />
          <span className="hidden sm:inline">{m.l}</span>
        </button>
      ))}
    </div>
  );
}

export function Breadcrumb({
  uf,
  ufLabel,
  city,
  onBrazil,
  onState,
}: {
  uf?: string | undefined;
  ufLabel?: string | undefined;
  city?: string | undefined;
  onBrazil(): void;
  onState(): void;
}) {
  return (
    <nav
      className="glass flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs"
      aria-label="Navegação geográfica"
    >
      <button
        onClick={onBrazil}
        className={cn("hover:text-foreground", uf ? "text-muted-foreground" : "font-medium")}
      >
        Brasil
      </button>
      {uf && (
        <>
          <ChevronRight className="size-3 text-muted-foreground" />
          <button
            onClick={onState}
            className={cn("hover:text-foreground", city ? "text-muted-foreground" : "font-medium")}
          >
            {ufLabel}
          </button>
        </>
      )}
      {city && (
        <>
          <ChevronRight className="size-3 text-muted-foreground" />
          <span className="font-medium text-cyan">{city}</span>
        </>
      )}
    </nav>
  );
}

export function ZoomControls({
  onIn,
  onOut,
  onReset,
}: {
  onIn(): void;
  onOut(): void;
  onReset(): void;
}) {
  const b =
    "flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  return (
    <div className="glass flex flex-col overflow-hidden rounded-lg">
      <button className={b} onClick={onIn} aria-label="Aumentar zoom">
        <Plus className="size-4" />
      </button>
      <button className={cn(b, "border-y")} onClick={onOut} aria-label="Diminuir zoom">
        <Minus className="size-4" />
      </button>
      <button className={b} onClick={onReset} aria-label="Visão nacional">
        <Home className="size-4" />
      </button>
    </div>
  );
}

export function Legend({
  mode,
  theme,
  max,
  unplaced,
}: {
  mode: MapMode;
  theme: "dark" | "light";
  max: number;
  unplaced: number;
}) {
  const pal = MAP_PALETTES[theme];
  return (
    <div className="glass w-56 rounded-lg px-3 py-2.5 text-[11px]">
      {mode === "points" && (
        <>
          <div className="label-xs mb-2">Visitas por localização</div>
          <div className="flex items-end gap-3">
            {[0.15, 0.5, 1].map((r) => (
              <div key={r} className="flex flex-col items-center gap-1">
                <span
                  className="rounded-full bg-cyan/80 shadow-[0_0_10px_var(--glow)]"
                  style={{ width: 7 + Math.sqrt(r) * 18, height: 7 + Math.sqrt(r) * 18 }}
                />
                <span className="font-mono text-muted-foreground">
                  {fmtNum(Math.max(1, Math.round(max * r)))}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {mode !== "points" && (
        <>
          <div className="label-xs mb-2">
            {mode === "choropleth" ? "Visitas por estado" : "Concentração de visitas"}
          </div>
          <div
            className="h-2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${(mode === "choropleth" ? pal.scale : pal.heat).join(",")})`,
            }}
          />
          <div className="mt-1 flex justify-between font-mono text-muted-foreground">
            <span>0</span>
            <span>{fmtNum(max)}</span>
          </div>
        </>
      )}
      {unplaced > 0 && mode !== "choropleth" && (
        <div className="mt-2 flex items-start gap-1.5 border-t pt-2 text-muted-foreground">
          <Info className="mt-0.5 size-3 shrink-0" />
          {fmtNum(unplaced)} visitas sem referência geográfica suficiente para exibição no mapa
        </div>
      )}
    </div>
  );
}
