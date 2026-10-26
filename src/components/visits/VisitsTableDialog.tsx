import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Visit } from "@/types/visit";
import { downloadCsv } from "@/utils/csv";
import { fmtDate, fmtNum } from "@/utils/format";
import { normalize, resolveUF, visitCoords } from "@/utils/geo";
import { StatusBadge } from "./StatusBadge";

type Col = "date" | "accountName" | "responsibleName" | "state" | "city" | "activityCategory" | "status" | "id";
const COLS: { key: Col; label: string }[] = [
  { key: "date", label: "Data" },
  { key: "accountName", label: "Cliente" },
  { key: "responsibleName", label: "Responsável" },
  { key: "state", label: "UF" },
  { key: "city", label: "Cidade" },
  { key: "activityCategory", label: "Categoria" },
  { key: "status", label: "Status" },
  { key: "id", label: "ID" },
];
const PAGE = 14;

const val = (v: Visit, k: Col) => (k === "state" ? (resolveUF(v.state) ?? "") : ((v[k] as string | undefined) ?? ""));

export function VisitsTableDialog({ open, onOpenChange, visits, scopeLabel }: { open: boolean; onOpenChange(o: boolean): void; visits: Visit[]; scopeLabel: string }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: Col; dir: 1 | -1 }>({ k: "date", dir: -1 });
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Visit | null>(null);

  const rows = useMemo(() => {
    const nq = normalize(q);
    const list = nq ? visits.filter((v) => normalize(COLS.map((c) => val(v, c.key)).join(" ")).includes(nq)) : visits;
    return [...list].sort((a, b) => val(a, sort.k).localeCompare(val(b, sort.k), "pt-BR") * sort.dir);
  }, [visits, q, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const slice = rows.slice(cur * PAGE, cur * PAGE + PAGE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-[min(1200px,96vw)] flex-col gap-3 sm:max-w-[min(1200px,96vw)]">
        <DialogHeader>
          <DialogTitle>Visitas detalhadas</DialogTitle>
          <DialogDescription>
            {scopeLabel} · {fmtNum(rows.length)} registros (filtros aplicados)
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar cliente, responsável, cidade, ID…" className="h-9 pl-8 text-xs" />
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCsv(rows, `fesa-visitas-${new Date().toISOString().slice(0, 10)}.csv`)} disabled={!rows.length}>
            <Download /> Exportar CSV
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 gap-3">
          <div className="scroll-thin min-h-0 flex-1 overflow-auto rounded-lg border">
            <table className="w-full min-w-[820px] text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b">
                  {COLS.map((c) => (
                    <th key={c.key} className="px-3 py-2 text-left font-medium">
                      <button
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setSort((s) => ({ k: c.key, dir: s.k === c.key ? ((s.dir * -1) as 1 | -1) : 1 }))}
                      >
                        {c.label}
                        {sort.k === c.key ? sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((v) => (
                  <tr key={v.id} onClick={() => setDetail(v)} className={`cursor-pointer border-b transition-colors hover:bg-accent/50 ${detail?.id === v.id ? "bg-accent/60" : ""}`}>
                    <td className="px-3 py-2 font-mono">{fmtDate(v.date)}</td>
                    <td className="max-w-[200px] truncate px-3 py-2">{v.accountName}</td>
                    <td className="px-3 py-2">{v.responsibleName ?? "—"}</td>
                    <td className="px-3 py-2 font-mono">{resolveUF(v.state) ?? "—"}</td>
                    <td className="px-3 py-2">{v.city ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-2">{v.activityCategory ?? "—"}</td>
                    <td className="px-3 py-2"><StatusBadge status={v.status} /></td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{v.id}</td>
                  </tr>
                ))}
                {!slice.length && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">Nenhuma visita encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {detail && (
            <aside className="hidden w-64 shrink-0 space-y-2 rounded-lg border p-3 text-xs md:block">
              <div className="flex items-center justify-between">
                <span className="label-xs">Registro</span>
                <button onClick={() => setDetail(null)} aria-label="Fechar detalhe"><X className="size-3.5" /></button>
              </div>
              <div className="font-display text-sm font-semibold">{detail.accountName}</div>
              {(
                [
                  ["ID", detail.id],
                  ["ID do cliente", detail.accountId],
                  ["Data", fmtDate(detail.date)],
                  ["Semana / Ano", detail.week ? `${detail.week} / ${detail.year}` : undefined],
                  ["Semestre", detail.semester],
                  ["Responsável", detail.responsibleName],
                  ["Categoria", detail.activityCategory],
                  ["Status", detail.status],
                  ["Estado", detail.state],
                  ["Cidade", detail.city],
                  ["Coordenadas", (() => { const c = visitCoords(detail); return c ? `${c[1].toFixed(3)}, ${c[0].toFixed(3)}` : "não georreferenciado"; })()],
                ] as [string, string | undefined][]
              ).map(([l, v]) => (
                <div key={l} className="flex justify-between gap-2 border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="text-right">{v ?? "—"}</span>
                </div>
              ))}
            </aside>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Página {cur + 1} de {pages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-8" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="Página anterior"><ChevronLeft /></Button>
            <Button variant="outline" size="icon" className="size-8" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label="Próxima página"><ChevronRight /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
