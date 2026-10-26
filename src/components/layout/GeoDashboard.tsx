import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RefreshCw, SearchX } from "lucide-react";
import { useVisits } from "@/hooks/useVisits";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { visitsService } from "@/services/visitsService";
import type { MapMode, PeriodPreset, Selection, VisitFilters } from "@/types/visit";
import {
  aggregateByCity,
  aggregateByState,
  aggregateMapPoints,
  computeKpis,
  dataQuality,
} from "@/utils/aggregations";
import {
  applyFilters,
  countActiveFilters,
  detectPreset,
  emptyFilters,
  presetRange,
  previousRange,
} from "@/utils/filters";
import { resolveUF, ufName, visitCityKey, visitCoords } from "@/utils/geo";
import { AppHeader } from "./AppHeader";
import { KpiStrip } from "@/components/indicators/KpiStrip";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { InsightPanel } from "@/components/analytics/InsightPanel";
import { DataQualityPopover } from "@/components/analytics/DataQualityPopover";
import { BrazilMap, type BrazilMapHandle } from "@/components/map/BrazilMap";
import { Breadcrumb, Legend, ModeSwitch, ZoomControls } from "@/components/map/MapOverlay";
import { VisitsTableDialog } from "@/components/visits/VisitsTableDialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function GeoDashboard() {
  const { data: visits, isLoading, error, refetch } = useVisits();
  const root = useRef<HTMLDivElement>(null);
  const mapRef = useRef<BrazilMapHandle>(null);
  const wide = useMediaQuery("(min-width: 1180px)");

  const [filters, setFilters] = useState<VisitFilters>(emptyFilters);
  const [selection, setSelection] = useState<Selection>({});
  const [mode, setMode] = useState<MapMode>("points");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showFilters, setShowFilters] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [tableOpen, setTableOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  useEffect(() => {
    if (!wide) {
      setShowFilters(false);
      setShowInsights(false);
    } else {
      setShowFilters(true);
      setShowInsights(true);
    }
  }, [wide]);

  const all = visits ?? [];
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const kpis = useMemo(() => (visits ? computeKpis(filtered) : undefined), [visits, filtered]);
  const previousTotal = useMemo(() => {
    if (!filters.from || !filters.to) return null;
    const pr = previousRange(filters.from, filters.to);
    return applyFilters(all, { ...filters, ...pr }).length;
  }, [all, filters]);
  const states = useMemo(() => aggregateByState(filtered), [filtered]);
  const cities = useMemo(() => aggregateByCity(filtered), [filtered]);
  const mapPoints = useMemo(() => aggregateMapPoints(filtered), [filtered]);
  const quality = useMemo(() => dataQuality(filtered), [filtered]);

  const selectedCity = selection.cityKey
    ? cities.find((c) => c.key === selection.cityKey)
    : undefined;
  const scopeVisits = useMemo(() => {
    if (selection.cityKey) return filtered.filter((v) => visitCityKey(v) === selection.cityKey);
    if (selection.uf) return filtered.filter((v) => resolveUF(v.state) === selection.uf);
    return filtered;
  }, [filtered, selection]);

  const scopeUnplaced = useMemo(
    () => scopeVisits.filter((v) => !visitCoords(v)).length,
    [scopeVisits],
  );
  const legendMax =
    mode === "choropleth"
      ? Math.max(0, ...[...states.values()].map((s) => s.total))
      : Math.max(0, ...mapPoints.map((p) => p.total));

  const selectState = (uf: string) => {
    setSelection({ uf });
    if (!wide) setShowInsights(true);
    else setShowInsights(true);
  };
  const selectCity = (key: string) => {
    setSelection({ uf: key.split("|")[0], cityKey: key });
    setShowInsights(true);
  };
  const toBrazil = () => setSelection({});
  const toState = () => setSelection((s) => ({ uf: s.uf }));

  const onPreset = (p: PeriodPreset) =>
    setFilters((f) => ({ ...f, from: undefined, to: undefined, ...presetRange(p) }));
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.current?.requestFullscreen?.().catch(() => undefined);
  };

  const scopeLabel = selectedCity
    ? `${selectedCity.city} · ${selectedCity.uf}`
    : selection.uf
      ? ufName(selection.uf)
      : "Brasil";

  const filterPanel = visits ? (
    <FilterPanel
      visits={all}
      applied={filters}
      onApply={(f) => {
        setFilters(f);
        if (!wide) setShowFilters(false);
      }}
    />
  ) : null;
  const insightPanel = visits ? (
    <InsightPanel
      scopeVisits={scopeVisits}
      allFiltered={filtered}
      states={states}
      cities={cities}
      selectedUf={selection.uf}
      selectedCity={selectedCity}
      onSelectState={selectState}
      onSelectCity={selectCity}
      onBackToBrazil={toBrazil}
      onBackToState={toState}
      onOpenTable={() => setTableOpen(true)}
    />
  ) : null;

  return (
    <div
      ref={root}
      className="flex h-dvh min-h-[560px] flex-col gap-2 bg-background p-2 md:gap-3 md:p-3"
    >
      <AppHeader
        source={visitsService.source}
        preset={detectPreset(filters)}
        onPreset={onPreset}
        activeFilters={countActiveFilters(filters)}
        onToggleFilters={() => setShowFilters((s) => !s)}
        onToggleInsights={() => setShowInsights((s) => !s)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        extra={visits ? <DataQualityPopover q={quality} /> : null}
      />

      {error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Erro ao carregar dados"}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <KpiStrip kpis={kpis} previousTotal={previousTotal} />

          <main className="flex min-h-0 flex-1 gap-2 md:gap-3">
            <AnimatePresence initial={false}>
              {wide && showFilters && (
                <motion.aside
                  key="f"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 290, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="glass shrink-0 overflow-hidden rounded-xl"
                >
                  <div className="h-full w-[290px]">{filterPanel ?? <PanelSkeleton />}</div>
                </motion.aside>
              )}
            </AnimatePresence>

            <section className="map-backdrop glass relative min-w-0 flex-1 overflow-hidden rounded-xl">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-3/4 w-2/3 rounded-[40%]" />
                </div>
              ) : (
                <>
                  <BrazilMap
                    ref={mapRef}
                    mode={mode}
                    theme={theme}
                    states={states}
                    cities={cities}
                    mapPoints={mapPoints}
                    visits={filtered}
                    selectedUf={selection.uf}
                    selectedCity={selection.cityKey}
                    onSelectState={selectState}
                    onSelectCity={selectCity}
                  />
                  <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="pointer-events-auto">
                      <ModeSwitch mode={mode} onChange={setMode} />
                    </div>
                    <div className="pointer-events-auto">
                      <Breadcrumb
                        uf={selection.uf}
                        ufLabel={selection.uf ? ufName(selection.uf) : undefined}
                        city={selectedCity?.city}
                        onBrazil={toBrazil}
                        onState={toState}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 hidden sm:block">
                    <Legend mode={mode} theme={theme} max={legendMax} unplaced={scopeUnplaced} />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <ZoomControls
                      onIn={() => mapRef.current?.zoomIn()}
                      onOut={() => mapRef.current?.zoomOut()}
                      onReset={() => {
                        toBrazil();
                        mapRef.current?.reset();
                      }}
                    />
                  </div>
                  {filtered.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass flex flex-col items-center gap-2 rounded-xl px-6 py-5 text-center">
                        <SearchX className="size-6 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Nenhuma visita para os filtros selecionados
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setFilters(emptyFilters())}
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    </div>
                  )}
                  <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/70">
                    {visitsService.source === "mock"
                      ? "Dados demonstrativos — não representam operações reais"
                      : ""}
                  </span>
                </>
              )}
            </section>

            <AnimatePresence initial={false}>
              {wide && showInsights && (
                <motion.aside
                  key="i"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="glass shrink-0 overflow-hidden rounded-xl"
                >
                  <div className="h-full w-[340px]">{insightPanel ?? <PanelSkeleton />}</div>
                </motion.aside>
              )}
            </AnimatePresence>
          </main>
        </>
      )}

      {!wide && (
        <>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetContent side="left" className="w-[320px] p-0">
              <SheetTitle className="sr-only">Filtros</SheetTitle>
              {filterPanel}
            </SheetContent>
          </Sheet>
          <Sheet open={showInsights} onOpenChange={setShowInsights}>
            <SheetContent side="right" className="w-[360px] p-0">
              <SheetTitle className="sr-only">Painel de inteligência</SheetTitle>
              {insightPanel}
            </SheetContent>
          </Sheet>
        </>
      )}

      <VisitsTableDialog
        open={tableOpen}
        onOpenChange={setTableOpen}
        visits={scopeVisits}
        scopeLabel={scopeLabel}
      />
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-9" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry(): void }) {
  return (
    <div className="glass flex flex-1 flex-col items-center justify-center gap-3 rounded-xl p-8 text-center">
      <AlertTriangle className="size-8 text-warning" />
      <h2 className="text-lg font-semibold">Não foi possível carregar as visitas</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {message} Verifique se o backend está em execução e a variável VITE_API_BASE_URL.
      </p>
      <Button onClick={onRetry} variant="secondary">
        <RefreshCw /> Tentar novamente
      </Button>
    </div>
  );
}
