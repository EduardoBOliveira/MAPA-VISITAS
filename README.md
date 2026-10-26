# FESA GEO INTELLIGENCE

Inteligência geográfica de visitas comerciais (frontend, dados simulados nesta etapa).

## Executar localmente (Windows / VS Code)

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (padrão http://localhost:8080).

## Fonte de dados

Copie `.env.example` para `.env`:

- `VITE_DATA_SOURCE=mock` — dados simulados (padrão, sem backend)
- `VITE_DATA_SOURCE=api` + `VITE_API_BASE_URL=http://localhost:8000` — consome `GET /api/visits` (ver `docs/API_CONTRACT.md`)

## Estrutura

- `src/types` — tipo `Visit` padronizado
- `src/services` — `visitsService` (escolhe mock/API), `mockVisitsService`, `apiVisitsService`
- `src/data` — dados simulados e coordenadas de referência das cidades
- `src/utils` — filtros, agregações, geografia, CSV
- `src/components` — layout, map (ECharts), filters, indicators, analytics, visits
- `public/geo/brazil-states.json` — GeoJSON real das 27 UFs (simplificado)

## Observações

- Stack: React + TypeScript + Vite + Tailwind + shadcn/ui + Apache ECharts + Framer Motion, sobre TanStack Start (roteamento/SSR). Funciona como aplicação independente ou incorporada em iframe (layout fluido, sem dimensões fixas).
- Registros sem coordenadas válidas nunca são posicionados no mapa; aparecem nos indicadores e na seção "Qualidade".
- Testes: `npx vitest run`.
