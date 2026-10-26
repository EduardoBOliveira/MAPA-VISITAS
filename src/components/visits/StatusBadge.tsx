
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  Realizado: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  Concluída: "border-success/40 text-success",
  Planejada: "border-primary/40 text-primary",
  "Em andamento": "border-cyan/40 text-cyan",
  Cancelada: "border-destructive/40 text-destructive",
};

export function StatusBadge({ status }: { status?: string | undefined }) {
  if (!status) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        TONE[status] ?? "text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}
