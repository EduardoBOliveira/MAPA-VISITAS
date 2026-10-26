import { environment } from "@/config/environment";
import type { Visit } from "@/types/visit";
import { apiVisitsService } from "./apiVisitsService";
import { mockVisitsService } from "./mockVisitsService";

/** Single contract every data source implements. UI only talks to this. */
export interface VisitsService {
  readonly source: "mock" | "api";
  getVisits(signal?: AbortSignal): Promise<Visit[]>;
}

export const visitsService: VisitsService =
  environment.dataSource === "api" ? apiVisitsService : mockVisitsService;
