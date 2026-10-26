const nf = new Intl.NumberFormat("pt-BR");
export const fmtNum = (n: number) => nf.format(n);
export const fmtPct = (r: number, digits = 1) =>
  `${(r * 100).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
