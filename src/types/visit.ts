/**
 * Standardized visit record consumed by the whole UI.
 * The Python/FastAPI backend is responsible for mapping the raw spreadsheet
 * columns (data_visita, Account, UsrEstado, ...) into this shape.
 */
export interface Visit {
  id: string;
  /** ISO date (YYYY-MM-DD or full ISO timestamp) */
  date: string;
  year?: number | undefined;
  week?: number | undefined;
  semester?: string | undefined;
  accountId?: string | undefined;
  accountName: string;
  activityCategory?: string | undefined;
  status?: string | undefined;
  country?: string | undefined;
  /** State name or UF abbreviation — both are accepted */
  state?: string | undefined;
  city?: string | undefined;
  location?: string | undefined;
  commercialRegion?: string | null | undefined;
  locationName?: string | null | undefined;
  geoPrecision?: string | null | undefined;
  responsibleName?: string | undefined;
  latitude?: number | undefined | null;
  longitude?: number | undefined | null;
}

export interface VisitFilters {
  from?: string | undefined; // YYYY-MM-DD inclusive
  to?: string | undefined; // YYYY-MM-DD inclusive
  states: string[]; // UF codes
  cities: string[]; // city keys "UF|normalized"
  commercialRegions: string[]; // SE, CE, SUL, NE, NO, CO
  commercialLocations: string[]; // UsrLocalizacao original
  responsibles: string[];
  accounts: string[]; // account keys (id or name)
  categories: string[];
  statuses: string[];
}

export type PeriodPreset = "7d" | "30d" | "month" | "year" | "all" | "custom";

export type MapMode = "points" | "choropleth" | "heat";

export interface Selection {
  uf?: string | undefined;
  cityKey?: string | undefined;
}
