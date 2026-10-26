import { generateMockVisits } from "@/data/mockVisits";
import type { Visit } from "@/types/visit";
import type { VisitsService } from "./visitsService";

let cache: Visit[] | null = null;

export const mockVisitsService: VisitsService = {
  source: "mock",
  async getVisits() {
    // small delay so loading states are visible during development
    await new Promise((r) => setTimeout(r, 450));
    cache ??= generateMockVisits();
    return cache;
  },
};
