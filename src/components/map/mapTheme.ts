/** Canvas colors for ECharts (canvas needs hex/rgba, not CSS variables). */
export interface MapPalette {
  land: string;
  landActive: string;
  border: string;
  hover: string;
  selected: string;
  selectedBorder: string;
  point: string;
  pointGlow: string;
  label: string;
  tooltipBg: string;
  tooltipBorder: string;
  scale: string[];
  heat: string[];
}

export const MAP_PALETTES: Record<"dark" | "light", MapPalette> = {
  dark: {
    land: "#0f1a33",
    landActive: "#14284d",
    border: "rgba(120,170,255,0.28)",
    hover: "#1d3d73",
    selected: "#1b4a8a",
    selectedBorder: "#4fd8ff",
    point: "#38d6ff",
    pointGlow: "rgba(56,214,255,0.65)",
    label: "#cfe6ff",
    tooltipBg: "rgba(12,22,44,0.92)",
    tooltipBorder: "rgba(120,170,255,0.25)",
    scale: ["#13213f", "#173d73", "#1f63b5", "#2b8de6", "#3fd0ff"],
    heat: ["#0b3d91", "#1e88e5", "#26c6da", "#69f0ae", "#fff59d"],
  },
  light: {
    land: "#e6edf7",
    landActive: "#d3e2f7",
    border: "rgba(40,80,150,0.35)",
    hover: "#b9d2f3",
    selected: "#9cc2f2",
    selectedBorder: "#0b6bd6",
    point: "#0b74de",
    pointGlow: "rgba(11,116,222,0.45)",
    label: "#16325c",
    tooltipBg: "rgba(255,255,255,0.96)",
    tooltipBorder: "rgba(40,80,150,0.2)",
    scale: ["#e3ecf8", "#b5cff0", "#7aaee6", "#3a85d6", "#0b5cb8"],
    heat: ["#90caf9", "#42a5f5", "#26c6da", "#66bb6a", "#ffa726"],
  },
};
