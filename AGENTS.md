<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- UI reads visits only through `src/services/visitsService.ts` (mock/api chosen by VITE_DATA_SOURCE) — keeps the frontend independent of the future FastAPI backend.
- All filtering/aggregation lives in `src/utils/{filters,aggregations,geo}.ts`; components never recompute business rules — single source of truth for consistent totals.
- Never invent coordinates: use record lat/lng or `src/data/cityCoordinates.ts`, else leave unplaced — explicit product requirement.
- ECharts is dynamically imported inside effects in `BrazilMap` — it is browser-only and must not run during SSR.
- Map canvas colors live in `src/components/map/mapTheme.ts` (canvas cannot read CSS variables).
