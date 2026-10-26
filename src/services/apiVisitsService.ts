import { environment } from "@/config/environment";
import type { Visit } from "@/types/visit";
import type { VisitsService } from "./visitsService";

/**
 * HTTP client for the future FastAPI backend.
 * Contract: GET {VITE_API_BASE_URL}/api/visits -> { data: Visit[] } (or Visit[]).
 * No silent fallback to mock data: failures surface as errors to the UI.
 */
export class ApiError extends Error {}

function isVisit(x: unknown): x is Visit {
  const v = x as Visit;
  return !!v && typeof v.id === "string" && typeof v.date === "string" && typeof v.accountName === "string";
}

export const apiVisitsService: VisitsService = {
  source: "api",
  async getVisits(signal) {
    const url = `${environment.apiBaseUrl}/api/visits`;
    let res: Response;
    try {
      res = await fetch(url, { signal: signal ?? null, headers: { Accept: "application/json" } });
    } catch {
      throw new ApiError(`Não foi possível conectar à API em ${url}.`);
    }
    if (!res.ok) throw new ApiError(`A API respondeu com erro ${res.status}.`);
    const body: unknown = await res.json();
    const list = Array.isArray(body) ? body : (body as { data?: unknown }).data;
    if (!Array.isArray(list)) throw new ApiError("Formato de resposta inválido: esperado { data: Visit[] }.");
    return list.filter(isVisit);
  },
};
