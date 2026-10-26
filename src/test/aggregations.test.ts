import { describe, expect, it } from "vitest";
import type { Visit } from "@/types/visit";
import { aggregateByCity, computeKpis, dataQuality } from "@/utils/aggregations";
import { applyFilters, emptyFilters } from "@/utils/filters";

const base = (o: Partial<Visit>): Visit => ({ id: Math.random().toString(), date: "2026-05-10", accountName: "X", ...o });

describe("aggregation rules", () => {
  it("counts distinct clients by accountId when available", () => {
    const v = [base({ accountId: "A1", accountName: "Foo" }), base({ accountId: "A1", accountName: "Foo Ltda" }), base({ accountId: "A2" })];
    expect(computeKpis(v).clients).toBe(2);
  });
  it("groups visits of the same city into one marker, accepting state name or UF", () => {
    const v = [base({ state: "SP", city: "Campinas" }), base({ state: "São Paulo", city: "campinas" })];
    const c = aggregateByCity(v);
    expect(c).toHaveLength(1);
    expect(c[0]!.total).toBe(2);
  });
  it("never positions records without known coordinates but keeps them in totals", () => {
    const v = [base({ state: "MT", city: "Tangará da Serra" }), base({}), base({ state: "SP", city: "Campinas" })];
    expect(computeKpis(v).total).toBe(3);
    expect(dataQuality(v).withCoords).toBe(1);
    expect(aggregateByCity(v).find((c) => c.city === "Tangará da Serra")!.coord).toBeNull();
  });
  it("applies date range inclusively and combines filters", () => {
    const v = [base({ date: "2026-01-01", status: "Concluída" }), base({ date: "2026-01-31", status: "Cancelada" }), base({ date: "2026-02-01", status: "Concluída" })];
    expect(applyFilters(v, { ...emptyFilters(), from: "2026-01-01", to: "2026-01-31" })).toHaveLength(2);
    expect(applyFilters(v, { ...emptyFilters(), from: "2026-01-01", to: "2026-01-31", statuses: ["Concluída"] })).toHaveLength(1);
  });
});
