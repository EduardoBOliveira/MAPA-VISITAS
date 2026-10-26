import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  hint?: string | undefined;
}

interface Props {
  label: string;
  options: Option[];
  value: string[];
  onChange(v: string[]): void;
  placeholder?: string | undefined;
}

export function MultiSelect({ label, options, value, onChange, placeholder = "Todos" }: Props) {
  const sel = new Set(value);
  const toggle = (v: string) => onChange(sel.has(v) ? value.filter((x) => x !== v) : [...value, v]);
  const summary = value.length === 0 ? placeholder : value.length === 1 ? (options.find((o) => o.value === value[0])?.label ?? value[0]) : `${value.length} selecionados`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="label-xs">{label}</span>
        {value.length > 0 && (
          <button onClick={() => onChange([])} className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground">
            <X className="size-3" /> limpar
          </button>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-9 w-full justify-between bg-transparent text-xs font-normal", value.length && "border-primary/50 text-foreground")}>
            <span className="truncate">{summary}</span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}…`} className="text-xs" />
            <CommandList className="scroll-thin max-h-64">
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">Nenhum resultado</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem key={o.value} value={`${o.label} ${o.hint ?? ""}`} onSelect={() => toggle(o.value)} className="text-xs">
                    <div className={cn("mr-2 flex size-4 items-center justify-center rounded border", sel.has(o.value) ? "border-primary bg-primary text-primary-foreground" : "opacity-60")}>
                      {sel.has(o.value) && <Check className="size-3" />}
                    </div>
                    <span className="truncate">{o.label}</span>
                    {o.hint && <span className="ml-auto pl-2 font-mono text-[10px] text-muted-foreground">{o.hint}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
