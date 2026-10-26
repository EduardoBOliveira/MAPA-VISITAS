import { CITY_REFERENCES } from "@/data/cityCoordinates";
import type { Visit } from "@/types/visit";
import { COMMERCIAL_REFERENCES } from "@/data/commercialCoordinates";

export const UF_LIST: { uf: string; name: string; region: string }[] = [
  { uf: "AC", name: "Acre", region: "Norte" },
  { uf: "AL", name: "Alagoas", region: "Nordeste" },
  { uf: "AP", name: "Amapá", region: "Norte" },
  { uf: "AM", name: "Amazonas", region: "Norte" },
  { uf: "BA", name: "Bahia", region: "Nordeste" },
  { uf: "CE", name: "Ceará", region: "Nordeste" },
  { uf: "DF", name: "Distrito Federal", region: "Centro-Oeste" },
  { uf: "ES", name: "Espírito Santo", region: "Sudeste" },
  { uf: "GO", name: "Goiás", region: "Centro-Oeste" },
  { uf: "MA", name: "Maranhão", region: "Nordeste" },
  { uf: "MT", name: "Mato Grosso", region: "Centro-Oeste" },
  { uf: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste" },
  { uf: "MG", name: "Minas Gerais", region: "Sudeste" },
  { uf: "PA", name: "Pará", region: "Norte" },
  { uf: "PB", name: "Paraíba", region: "Nordeste" },
  { uf: "PR", name: "Paraná", region: "Sul" },
  { uf: "PE", name: "Pernambuco", region: "Nordeste" },
  { uf: "PI", name: "Piauí", region: "Nordeste" },
  { uf: "RJ", name: "Rio de Janeiro", region: "Sudeste" },
  { uf: "RN", name: "Rio Grande do Norte", region: "Nordeste" },
  { uf: "RS", name: "Rio Grande do Sul", region: "Sul" },
  { uf: "RO", name: "Rondônia", region: "Norte" },
  { uf: "RR", name: "Roraima", region: "Norte" },
  { uf: "SC", name: "Santa Catarina", region: "Sul" },
  { uf: "SP", name: "São Paulo", region: "Sudeste" },
  { uf: "SE", name: "Sergipe", region: "Nordeste" },
  { uf: "TO", name: "Tocantins", region: "Norte" },
];

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const UF_BY_KEY = new Map<string, string>();
for (const u of UF_LIST) {
  UF_BY_KEY.set(normalize(u.uf), u.uf);
  UF_BY_KEY.set(normalize(u.name), u.uf);
}

/** Accepts a UF code or a state name (any accents/case). Returns UF or null. */
export function resolveUF(state?: string | null): string | null {
  if (!state) return null;
  return UF_BY_KEY.get(normalize(state)) ?? null;
}

export function ufName(uf: string): string {
  return UF_LIST.find((u) => u.uf === uf)?.name ?? uf;
}

export function cityKey(uf: string, city: string): string {
  return `${uf}|${normalize(city)}`;
}

export function visitCityKey(v: Visit): string | null {
  const uf = resolveUF(v.state);
  if (!uf || !v.city || !v.city.trim()) return null;
  return cityKey(uf, v.city);
}

const REF_BY_KEY = new Map(CITY_REFERENCES.map((c) => [cityKey(c.uf, c.city), c]));

/** Rough Brazil bounding box used to reject obviously invalid coordinates. */
export function isValidBrazilCoord(lat?: number | null, lng?: number | null): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -34.5 &&
    lat <= 6 &&
    lng >= -74.5 &&
    lng <= -28.5
  );
}


/**
 * Hierarquia geográfica:
 * 1. Coordenada real da visita
 * 2. Referência municipal
 * 3. Referência comercial aproximada
 *
 * Cada visita recebe no máximo uma coordenada.
 */
export function visitCoords(v: Visit): [number, number] | null {
  // Nível 1: coordenadas reais
  if (isValidBrazilCoord(v.latitude, v.longitude)) {
    return [v.longitude as number, v.latitude as number];
  }

  // Nível 2: referência da cidade
  const key = visitCityKey(v);
  const cityRef = key ? REF_BY_KEY.get(key) : undefined;

  if (cityRef) {
    return [cityRef.lng, cityRef.lat];
  }

  // Nível 3: referência comercial aproximada
  const uf = resolveUF(v.state);
  const location = v.location?.trim();

  if (uf && location) {
    const commercialRef = COMMERCIAL_REFERENCES.find(
      (ref) => ref.uf === uf && ref.location === location
    );

    if (commercialRef) {
      return commercialRef.coord;
    }
  }

  // Sem referência confiável
  return null;
}


type Ring = number[][];
interface Feature {
  properties: { name: string; sigla: string };
  geometry: { type: string; coordinates: Ring[][] };
}

/** Bounding-box center and span for a state feature (used for smooth zoom). */
export function featureView(feature: Feature): { center: [number, number]; span: number } {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const poly of feature.geometry.coordinates)
    for (const ring of poly)
      for (const pt of ring) {
        const x = pt[0] ?? 0, y = pt[1] ?? 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { center: [(minX + maxX) / 2, (minY + maxY) / 2], span: Math.max(maxX - minX, maxY - minY) };
}
