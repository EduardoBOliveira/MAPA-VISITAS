/**
 * Runtime configuration from Vite env vars.
 *   VITE_DATA_SOURCE=mock | api   (default: mock)
 *   VITE_API_BASE_URL=http://localhost:8000
 */
export type DataSource = "mock" | "api";

const raw = (import.meta.env["VITE_DATA_SOURCE"] ?? "mock").toString().toLowerCase();

export const environment = {
  dataSource: (raw === "api" ? "api" : "mock") as DataSource,
  apiBaseUrl: (import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000").toString().replace(/\/$/, ""),
  geoJsonUrl: "/geo/brazil-states.json",
};
