import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { ECharts } from "echarts";
import { environment } from "@/config/environment";
import type { CityAgg, StateAgg, MapPointAgg } from "@/utils/aggregations";
import { fmtDate, fmtNum, fmtPct } from "@/utils/format";
import { featureView, resolveUF } from "@/utils/geo";
import type { MapMode, Visit } from "@/types/visit";
import { MAP_PALETTES } from "./mapTheme";
import { Loader2 } from "lucide-react";

const HOME = { center: [-53.5, -15.2] as [number, number], zoom: 1.15 };

export interface BrazilMapHandle {
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
}

interface Props {
  mode: MapMode;
  theme: "dark" | "light";
  states: Map<string, StateAgg>;
  cities: CityAgg[];
  mapPoints: MapPointAgg[];
  visits: Visit[];
  selectedUf?: string | undefined;
  selectedCity?: string | undefined;
  onSelectState(uf: string): void;
  onSelectCity(key: string): void;
}

interface GeoFeature {
  properties: { name: string; sigla: string };
  geometry: { type: string; coordinates: number[][][][] };
}

let geoPromise: Promise<{ features: GeoFeature[] }> | null = null;
const loadGeo = () =>
  (geoPromise ??= fetch(environment.geoJsonUrl).then((r) => {
    if (!r.ok) throw new Error("GeoJSON indisponível");
    return r.json();
  }));

export const BrazilMap = forwardRef<BrazilMapHandle, Props>(function BrazilMap(props, ref) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const features = useRef<GeoFeature[]>([]);
  const view = useRef({ ...HOME });
  const propsRef = useRef(props);
  propsRef.current = props;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyView = (animate = true) => {
    chart.current?.setOption({
      animationDurationUpdate: animate ? 700 : 0,
      animationEasingUpdate: "cubicInOut",
      geo: { map: "brazil", center: view.current.center, zoom: view.current.zoom },
    });
  };

  useImperativeHandle(ref, () => ({
    zoomIn() {
      view.current.zoom = Math.min(view.current.zoom * 1.4, 14);
      applyView();
    },
    zoomOut() {
      view.current.zoom = Math.max(view.current.zoom / 1.4, 0.8);
      applyView();
    },
    reset() {
      view.current = { ...HOME };
      applyView();
    },
  }));

  // init once
  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;
    (async () => {
      try {
        const [echarts, geo] = await Promise.all([import("echarts"), loadGeo()]);
        if (disposed || !el.current) return;
        features.current = geo.features;
        echarts.registerMap("brazil", geo as never);
        const c = echarts.init(el.current, undefined, { renderer: "canvas" });
        chart.current = c;
        c.on("georoam", () => {
          const g = (
            c.getOption() as { geo?: { center?: [number, number]; zoom?: number | undefined }[] }
          ).geo?.[0];
          if (g?.zoom) view.current.zoom = g.zoom;
          if (g?.center) view.current.center = g.center as [number, number];
        });
        c.on("click", (p) => {
          const data = p.data as { key?: string | undefined } | undefined;
          if (p.seriesType === "scatter" || p.seriesType === "effectScatter") {
            const point = propsRef.current.mapPoints.find(
              (item) => item.key === data?.key
            );

            if (point) {
              if (point.precision === "city") {
                propsRef.current.onSelectCity(point.key.replace(/^city\|/, ""));
              } else {
                propsRef.current.onSelectState(point.uf);
              }
            }
          } else if (p.componentType === "geo" || p.seriesType === "map") {
            const uf = resolveUF(p.name);
            if (uf) propsRef.current.onSelectState(uf);
          }
        });
        ro = new ResizeObserver(() => c.resize());
        ro.observe(el.current);
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao carregar o mapa");
      }
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  // zoom to selected state
  useEffect(() => {
    if (!ready) return;
    if (!props.selectedUf) {
      view.current = { ...HOME };
    } else {
      const f = features.current.find((x) => x.properties.sigla === props.selectedUf);
      if (f) {
        const { center, span } = featureView(f);
        view.current = { center, zoom: Math.max(1.3, Math.min(14, (38 / span) * 0.7)) };
      }
    }
    applyView();
  }, [props.selectedUf, ready]);

  // data / mode / theme
  useEffect(() => {
    const c = chart.current;
    if (!ready || !c) return;
    const { mode, theme, states, cities, selectedUf, selectedCity } = props;
    const pal = MAP_PALETTES[theme];
    const nameToUf = new Map(features.current.map((f) => [f.properties.name, f.properties.sigla]));
    const maxState = Math.max(1, ...[...states.values()].map((s) => s.total));
    const geoCities = props.mapPoints;
    const maxCity = Math.max(1, ...geoCities.map((x) => x.total));

    const stateTip = (name: string) => {
      const uf = nameToUf.get(name) ?? resolveUF(name);
      const s = uf ? states.get(uf) : undefined;
      if (!s) return name;
      return `<div class="geo-tip"><div class="geo-tip__title">${s.name}<span class="geo-tip__badge">${s.uf}</span></div>
        <div class="geo-tip__row">Visitas<b>${fmtNum(s.total)}</b></div>
        <div class="geo-tip__row">Clientes distintos<b>${fmtNum(s.clients)}</b></div>
        <div class="geo-tip__row">Cidades visitadas<b>${fmtNum(s.cities)}</b></div>
        <div class="geo-tip__row">Responsáveis<b>${fmtNum(s.responsibles)}</b></div>
        <div class="geo-tip__row">Participação nacional<b>${fmtPct(s.share)}</b></div>
        <div class="geo-tip__hint">Clique para explorar o estado</div></div>`;
    };
    const cityTip = (k: string) => {
      const x = cities.find((y) => y.key === k);
      if (!x) return "";
      return `<div class="geo-tip"><div class="geo-tip__title">${x.city}<span class="geo-tip__badge">${x.uf}</span></div>
        <div class="geo-tip__row">Visitas<b>${fmtNum(x.total)}</b></div>
        <div class="geo-tip__row">Clientes distintos<b>${fmtNum(x.clients)}</b></div>
        <div class="geo-tip__row">Responsáveis<b>${fmtNum(x.responsibles)}</b></div>
        <div class="geo-tip__row">Visita mais recente<b>${fmtDate(x.lastDate)}</b></div>
        <div class="geo-tip__hint">Clique para ver as visitas</div></div>`;
    };

    const regions = features.current.map((f) => {
      const uf = f.properties.sigla;
      const s = states.get(uf);
      const isSel = uf === selectedUf;
      const has = (s?.total ?? 0) > 0;
      return {
        name: f.properties.name,
        itemStyle: isSel
          ? {
              areaColor: pal.selected,
              borderColor: pal.selectedBorder,
              borderWidth: 2,
              shadowColor: pal.pointGlow,
              shadowBlur: 20,
            }
          : {
              areaColor: has ? pal.landActive : pal.land,
              opacity: selectedUf ? 0.55 : has ? 1 : 0.7,
            },
      };
    });

    const symbol = (t: number) => 7 + Math.sqrt(t / maxCity) * 24;
    const top = new Set(geoCities.slice(0, 6).map((x) => x.key));
    const pointData = (list: MapPointAgg[]) =>
      list.map((x) => ({
        name: x.name,
        key: x.key,
        value: [x.coord[0], x.coord[1], x.total],
        itemStyle:
          x.precision === "city" && x.key === `city|${selectedCity}`
            ? { color: "#ffffff", borderColor: pal.point, borderWidth: 3 }
            : undefined,
      }));

    const series: unknown[] = [
      {
        type: "map",
        map: "brazil",
        geoIndex: 0,
        data: [...states.values()].map((s) => ({ name: s.name, value: s.total })),
        tooltip: { formatter: (p: { name: string }) => stateTip(p.name) },
      },
    ];
    const visualMap: unknown[] = [];

    if (mode === "points") {
      series.push(
        {
          type: "scatter",
          coordinateSystem: "geo",
          data: pointData(geoCities.filter((x) => !top.has(x.key))),
          symbolSize: (v: number[]) => symbol(v[2] ?? 0),
          itemStyle: {
            color: pal.point,
            opacity: 0.85,
            shadowBlur: 12,
            shadowColor: pal.pointGlow,
            borderColor: "rgba(255,255,255,0.35)",
            borderWidth: 1,
          },
          emphasis: { scale: 1.3, itemStyle: { opacity: 1 } },
          tooltip: {
            formatter: (p: { data: { key: string } }) => {
              const point = props.mapPoints.find((x) => x.key === p.data.key);
              if (!point) return "";

              return `<div class="geo-tip">
                <div class="geo-tip__title">${point.name}<span class="geo-tip__badge">${point.uf}</span></div>
                <div class="geo-tip__row">Visitas<b>${fmtNum(point.total)}</b></div>
                <div class="geo-tip__hint">${
                  point.precision === "real"
                    ? "Coordenada da visita"
                    : point.precision === "city"
                      ? "Referência municipal"
                      : "Localização comercial aproximada"
                }</div>
              </div>`;
            },
          },
          zlevel: 1,
        },
        {
          type: "effectScatter",
          coordinateSystem: "geo",
          data: pointData(geoCities.filter((x) => top.has(x.key))),
          symbolSize: (v: number[]) => symbol(v[2] ?? 0),
          rippleEffect: { brushType: "stroke", scale: 2.6, period: 5 },
          itemStyle: { color: pal.point, shadowBlur: 16, shadowColor: pal.pointGlow },
          label: {
            show: true,
            formatter: "{b}",
            position: "right",
            color: pal.label,
            fontSize: 11,
            fontFamily: "IBM Plex Sans",
          },
          tooltip: {
            formatter: (p: { data: { key: string } }) => {
              const point = props.mapPoints.find((x) => x.key === p.data.key);
              if (!point) return "";

              return `<div class="geo-tip">
                <div class="geo-tip__title">${point.name}<span class="geo-tip__badge">${point.uf}</span></div>
                <div class="geo-tip__row">Visitas<b>${fmtNum(point.total)}</b></div>
                <div class="geo-tip__hint">${
                  point.precision === "real"
                    ? "Coordenada da visita"
                    : point.precision === "city"
                      ? "Referência municipal"
                      : "Localização comercial aproximada"
                }</div>
              </div>`;
            },
          },
          zlevel: 2,
        },
      );
    } else if (mode === "choropleth") {
      visualMap.push({
        type: "continuous",
        min: 0,
        max: maxState,
        seriesIndex: 0,
        inRange: { color: pal.scale },
        show: false,
      });
    } else {
      series.push({
        type: "heatmap",
        coordinateSystem: "geo",
        data: geoCities.map((x) => [x.coord![0], x.coord![1], x.total]),
        pointSize: 18,
        blurSize: 26,
        tooltip: { show: false },
      });
      visualMap.push({
        type: "continuous",
        min: 0,
        max: maxCity,
        seriesIndex: 1,
        inRange: { color: pal.heat },
        show: false,
      });
    }

    c.setOption(
      {
        backgroundColor: "transparent",
        animationDurationUpdate: 500,
        tooltip: {
          trigger: "item",
          backgroundColor: pal.tooltipBg,
          borderColor: pal.tooltipBorder,
          borderWidth: 1,
          padding: [12, 14],
          extraCssText:
            "backdrop-filter: blur(12px); border-radius: 12px; box-shadow: 0 16px 40px -12px rgba(0,0,0,.5);",
          textStyle: { color: pal.label },
        },
        geo: {
          map: "brazil",
          roam: true,
          center: view.current.center,
          zoom: view.current.zoom,
          scaleLimit: { min: 0.8, max: 14 },
          selectedMode: false,
          label: { show: false },
          itemStyle: {
            areaColor: mode === "choropleth" ? undefined : pal.land,
            borderColor: pal.border,
            borderWidth: 0.8,
          },
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: pal.hover, borderColor: pal.selectedBorder, borderWidth: 1.4 },
          },
          regions:
            mode === "choropleth"
              ? regions.filter((r) => r.name && nameToUf.get(r.name) === selectedUf)
              : regions,
        },
        visualMap,
        series,
      },
      { replaceMerge: ["series", "visualMap"] },
    );
  }, [
    ready,
    props.mode,
    props.theme,
    props.states,
    props.cities,
    props.visits,
    props.selectedUf,
    props.selectedCity,
  ]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={el}
        className="absolute inset-0"
        role="img"
        aria-label="Mapa interativo do Brasil com visitas comerciais"
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando mapa do Brasil…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
});
