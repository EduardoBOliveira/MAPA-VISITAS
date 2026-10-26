# Contrato da API — FESA Geo Intelligence

`GET {VITE_API_BASE_URL}/api/visits`

Resposta (JSON):

```json
{ "data": [ { "id": "VIS-1", "date": "2026-10-16", "accountId": "ACC-1", "accountName": "Cliente X",
  "activityCategory": "Visita comercial", "status": "Concluída", "country": "Brasil",
  "state": "SP", "city": "Campinas", "location": "Campinas - SP", "responsibleName": "Fulano",
  "latitude": -22.9, "longitude": -47.06, "year": 2026, "week": 42, "semester": "2026-S2" } ] }
```

Um array simples `[ ... ]` também é aceito. Campos obrigatórios: `id`, `date` (ISO), `accountName`.
`state` pode ser sigla (UF) ou nome. `latitude/longitude` podem ser `null`.

Mapeamento sugerido da planilha (feito no backend Python):

| Planilha | Campo |
|---|---|
| data_visita | date |
| Núm. Semana | week |
| Ano | year |
| nm_Semestre | semester |
| Id | id |
| AccountId | accountId |
| Account | accountName |
| ActivityCategory | activityCategory |
| Status | status |
| UsrPais | country |
| UsrEstado | state |
| UsrCidade | city |
| UsrLocalizacao | location |
| nomeresponsavelvisita | responsibleName |

Em caso de falha da API, a interface mostra um erro claro — não há retorno silencioso para dados simulados.
