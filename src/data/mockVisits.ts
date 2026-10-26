import { CITY_REFERENCES } from "@/data/cityCoordinates";
import { ufName } from "@/utils/geo";
import type { Visit } from "@/types/visit";

/**
 * Deterministic fictitious dataset for development. All names are invented.
 * Includes: multi-visit cities, states without visits (AC, AP, RR, RO),
 * cities without reference coordinates and records with missing location.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RESPONSIBLES = [
  "Marina Albuquerque", "Rafael Montenegro", "Juliana Prates", "Thiago Vasconcelos",
  "Camila Ferraz", "Bruno Lacerda", "Larissa Quintela", "Diego Saraiva",
  "Patrícia Moura", "Gustavo Aranha", "Renata Bittencourt", "Felipe Damasceno",
];

const ACCOUNT_PREFIX = ["Grupo", "Indústrias", "Agro", "Logística", "Metalúrgica", "Distribuidora", "Construtora", "Têxtil", "Química", "Alimentos"];
const ACCOUNT_CORE = ["Aurora", "Horizonte", "Serra Azul", "Atlântica", "Vale Verde", "Nova Era", "Cerrado", "Pampa", "Ipê", "Litoral", "Boreal", "Monte Claro", "Rio Claro", "Sol Nascente", "Itaúna"];

const CATEGORIES = ["Visita comercial", "Prospecção", "Pós-venda", "Apresentação técnica", "Negociação"];
const STATUSES: [string, number][] = [["Concluída", 0.68], ["Planejada", 0.16], ["Em andamento", 0.08], ["Cancelada", 0.08]];

/** Relative weight per city (bigger hubs get more visits). */
const CITY_WEIGHT: Record<string, number> = {
  "São Paulo": 16, Campinas: 7, "Rio de Janeiro": 9, "Belo Horizonte": 7, Curitiba: 6,
  "Porto Alegre": 5, Salvador: 4, Recife: 4, Brasília: 5, Goiânia: 4, Fortaleza: 3,
  Joinville: 3, "Ribeirão Preto": 3, Uberlândia: 3, Manaus: 2, Cuiabá: 3,
};

const EXTRA_CITIES_NO_COORDS = [
  { city: "Tangará da Serra", uf: "MT" },
  { city: "Barreiras", uf: "BA" },
  { city: "Chapecó", uf: "SC" },
];

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)] as T;
}

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
}

function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function generateMockVisits(today: Date = new Date(), count = 1480): Visit[] {
  const r = rng(20261016);

  const accounts = Array.from({ length: 64 }, (_, i) => ({
    id: `ACC-${String(1001 + i)}`,
    name: `${ACCOUNT_PREFIX[i % ACCOUNT_PREFIX.length]} ${ACCOUNT_CORE[(i * 7) % ACCOUNT_CORE.length]}${i >= 30 ? " " + ["S.A.", "Ltda.", "do Brasil"][i % 3] : ""}`,
  }));

  const pool: { city: string; uf: string; lat?: number; lng?: number }[] = [];
  for (const c of CITY_REFERENCES) {
    const w = CITY_WEIGHT[c.city] ?? 1;
    for (let i = 0; i < w; i++) pool.push(c);
  }
  for (const c of EXTRA_CITIES_NO_COORDS) pool.push(c);

  const visits: Visit[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.pow(r(), 1.25) * 420);
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    const place = pick(r, pool);
    const acc = accounts[Math.floor(Math.pow(r(), 1.4) * accounts.length)]!;
    const sr = r();
    let acc2 = 0;
    const status = STATUSES.find(([, p]) => (acc2 += p) >= sr)?.[0] ?? "Concluída";

    const roll = r();
    let state: string | undefined = place.uf;
    let city: string | undefined = place.city;
    if (roll < 0.015) {
      state = undefined;
      city = undefined;
    } else if (roll < 0.045) {
      city = undefined;
    }
    // ~40% of records carry their own coordinates (as the backend may supply).
    const ownCoords = city && place.lat !== undefined && r() < 0.4;

    visits.push({
      id: `VIS-${String(100000 + i)}`,
      date: toISO(d),
      year: d.getFullYear(),
      week: isoWeek(d),
      semester: `${d.getFullYear()}-S${d.getMonth() < 6 ? 1 : 2}`,
      accountId: acc.id,
      accountName: acc.name,
      activityCategory: pick(r, CATEGORIES),
      status,
      country: "Brasil",
      // alternate between full state name and UF to mimic real-world inconsistency
      state: state && r() < 0.5 ? ufName(state) : state,
      city,
      location: city && state ? `${city} - ${state}` : undefined,
      responsibleName: pick(r, RESPONSIBLES),
      latitude: ownCoords ? place.lat : null,
      longitude: ownCoords ? place.lng : null,
    });
  }
  return visits;
}
