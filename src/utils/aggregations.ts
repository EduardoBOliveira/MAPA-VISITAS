import type { Visit } from "@/types/visit";
import { accountKey, dateOnly } from "./filters";
import {
  UF_LIST,
  resolveUF,
  ufName,
  visitCityKey,
  visitCoords,
  isValidBrazilCoord,
  cityKey,
} from "./geo";
import { CITY_REFERENCES } from "@/data/cityCoordinates";


export const DONE_STATUS = "Realizado";

export interface Kpis {
  total: number;
  done: number;
  clients: number;
  states: number;
  cities: number;
  responsibles: number;
}

export function computeKpis(visits: Visit[]): Kpis {
  const clients = new Set<string>();
  const states = new Set<string>();
  const cities = new Set<string>();
  const resp = new Set<string>();
  let done = 0;
  for (const v of visits) {
    clients.add(accountKey(v));
    const uf = resolveUF(v.state);
    if (uf) states.add(uf);
    const ck = visitCityKey(v);
    if (ck) cities.add(ck);
    if (v.responsibleName) resp.add(v.responsibleName);
    if (v.status === DONE_STATUS) done++;
  }
  return { total: visits.length, done, clients: clients.size, states: states.size, cities: cities.size, responsibles: resp.size };
}

export interface StateAgg {
  uf: string;
  name: string;
  total: number;
  clients: number;
  cities: number;
  responsibles: number;
  share: number; // 0..1 of the filtered total
}

export function aggregateByState(visits: Visit[]): Map<string, StateAgg> {
  const acc = new Map<string, { total: number; c: Set<string>; ci: Set<string>; r: Set<string> }>();
  for (const v of visits) {
    const uf = resolveUF(v.state);
    if (!uf) continue;
    let a = acc.get(uf);
    if (!a) acc.set(uf, (a = { total: 0, c: new Set(), ci: new Set(), r: new Set() }));
    a.total++;
    a.c.add(accountKey(v));
    const ck = visitCityKey(v);
    if (ck) a.ci.add(ck);
    if (v.responsibleName) a.r.add(v.responsibleName);
  }
  const out = new Map<string, StateAgg>();
  for (const u of UF_LIST) {
    const a = acc.get(u.uf);
    out.set(u.uf, {
      uf: u.uf,
      name: u.name,
      total: a?.total ?? 0,
      clients: a?.c.size ?? 0,
      cities: a?.ci.size ?? 0,
      responsibles: a?.r.size ?? 0,
      share: a && visits.length ? a.total / visits.length : 0,
    });
  }
  return out;
}

export interface CityAgg {
  key: string;
  city: string;
  uf: string;
  total: number;
  clients: number;
  responsibles: number;
  lastDate: string | null;
  coord: [number, number] | null;
}

/** One entry per city — multiple visits in a city become a single marker. */
export function aggregateByCity(visits: Visit[]): CityAgg[] {
  const m = new Map<string, { city: string; uf: string; total: number; c: Set<string>; r: Set<string>; last: string | null; coord: [number, number] | null }>();
  for (const v of visits) {
    const key = visitCityKey(v);
    if (!key) continue;
    let a = m.get(key);
    if (!a) m.set(key, (a = { city: v.city!.trim(), uf: resolveUF(v.state)!, total: 0, c: new Set(), r: new Set(), last: null, coord: null }));
    a.total++;
    a.c.add(accountKey(v));
    if (v.responsibleName) a.r.add(v.responsibleName);
    const d = dateOnly(v.date);
    if (!a.last || d > a.last) a.last = d;
    a.coord ??= visitCoords(v);
  }
  return [...m.entries()]
    .map(([key, a]) => ({ key, city: a.city, uf: a.uf, total: a.total, clients: a.c.size, responsibles: a.r.size, lastDate: a.last, coord: a.coord }))
    .sort((x, y) => y.total - x.total);
}


export interface MapPointAgg {
  key: string;
  name: string;
  uf: string;
  total: number;
  coord: [number, number];
  precision: "real" | "city" | "commercial";
}

/**
 * Agrupa visitas para exibição no mapa.
 * Cada visita contribui para um único ponto.
 */
export function aggregateMapPoints(visits: Visit[]): MapPointAgg[] {
  const points = new Map<string, MapPointAgg>();

  for (const visit of visits) {
    const coord = visitCoords(visit);
    if (!coord) continue;

    const uf = resolveUF(visit.state);
    if (!uf) continue;

    const city = visitCityKey(visit);

    const precision: MapPointAgg["precision"] =
      visit.latitude != null &&
      visit.longitude != null &&
      isValidBrazilCoord(visit.latitude, visit.longitude)
        ? "real"
        : city && CITY_REFERENCES.some(
              (ref) => cityKey(ref.uf, ref.city) === city
            )
          ? "city"
          : "commercial";

    const key =
      precision === "real"
        ? `real|${coord[0]}|${coord[1]}`
        : precision === "city"
          ? `city|${city}`
          : `commercial|${uf}|${visit.location?.trim() ?? ""}`;

    const name =
      precision === "commercial"
        ? visit.location?.trim() || ufName(uf)
        : visit.city?.trim() || ufName(uf);

    const existing = points.get(key);

    if (existing) {
      existing.total++;
    } else {
      points.set(key, {
        key,
        name,
        uf,
        total: 1,
        coord,
        precision,
      });
    }
  }

  return [...points.values()].sort((a, b) => b.total - a.total);
}


export interface DataQuality {
  total: number;
  withState: number;
  withCity: number;
  withCoords: number;
  withoutLocation: number;
  coverage: number;  // 0..1 percentual de cobertura comercial
}


export function dataQuality(visits: Visit[]): DataQuality {
  let withState = 0;
  let withCity = 0;
  let withCoords = 0;
  let withCommercialLocation = 0;

  for (const v of visits) {
    if (resolveUF(v.state)) withState++;
    if (visitCityKey(v)) withCity++;
    if (visitCoords(v)) withCoords++;

    // UsrLocalizacao é a referência comercial principal.
    // Registros genéricos não representam uma área específica.
    const location = v.location?.trim();

    if (
      location &&
      !["20", "BRASIL", "ESTADOS UNIDOS"].includes(
        location.toUpperCase()
      )
    ) {
      withCommercialLocation++;
    }
  }

  return {
    total: visits.length,
    withState,
    withCity,
    withCoords,
    withoutLocation: visits.length - withCoords,

    // Qualidade principal: cobertura comercial.
    coverage: visits.length
      ? withCommercialLocation / visits.length
      : 0,
  };
}


export function countBy(visits: Visit[], get: (v: Visit) => string | undefined): { label: string; total: number }[] {
  const m = new Map<string, number>();
  for (const v of visits) {
    const k = get(v);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total);
}

export const stateLabel = (uf: string) => `${ufName(uf)} (${uf})`;

export function sortByDateDesc(visits: Visit[]): Visit[] {
  return [...visits].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
