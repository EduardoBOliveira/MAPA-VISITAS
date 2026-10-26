import { useQuery } from "@tanstack/react-query";
import { visitsService } from "@/services/visitsService";

export function useVisits() {
  return useQuery({
    queryKey: ["visits", visitsService.source],
    queryFn: ({ signal }) => visitsService.getVisits(signal),
    staleTime: 5 * 60_000,
    retry: visitsService.source === "api" ? 1 : 0,
  });
}
