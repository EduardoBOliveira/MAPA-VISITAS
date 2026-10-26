
export interface CommercialRef {
  location: string;
  uf: string;
  coord: [number, number];
}

/**
 * Referências cartográficas aproximadas das localizações
 * comerciais da FESA.
 *
 * Não representam endereços reais das visitas.
 * Coordenadas no formato [longitude, latitude].
 */
export const COMMERCIAL_REFERENCES: CommercialRef[] = [
  // São Paulo
  { location: "São Paulo Capital (SE)", uf: "SP", coord: [-46.6333, -23.5505] },
  { location: "Grande São Paulo (SE)", uf: "SP", coord: [-46.75, -23.65] },
  { location: "São Paulo Interior (SE)", uf: "SP", coord: [-47.8, -22.8] },
  { location: "São Paulo Litoral (SE)", uf: "SP", coord: [-46.3336, -23.9608] },

  // Sudeste
  { location: "Minas Gerais (SE)", uf: "MG", coord: [-43.9386, -19.9167] },
  { location: "Rio de Janeiro (SE)", uf: "RJ", coord: [-43.2096, -22.9035] },
  { location: "Espírito Santo (SE)", uf: "ES", coord: [-40.3378, -20.3155] },

  // Centro-Oeste e região comercial CE
  { location: "Goiás (CE)", uf: "GO", coord: [-49.2643, -16.6869] },
  { location: "Mato Grosso (CE)", uf: "MT", coord: [-56.0967, -15.6014] },
  { location: "Mato Grosso do Sul (CE)", uf: "MS", coord: [-54.6201, -20.4697] },
  { location: "Distrito Federal (CO)", uf: "DF", coord: [-47.8825, -15.7942] },

  // Sul
  { location: "Paraná (Sul)", uf: "PR", coord: [-49.2733, -25.4284] },
  { location: "Santa Catarina (Sul)", uf: "SC", coord: [-48.5482, -27.5949] },
  { location: "Rio Grande do Sul (Sul)", uf: "RS", coord: [-51.2302, -30.0346] },

  // Nordeste
  { location: "Pernambuco (NE)", uf: "PE", coord: [-34.8770, -8.0476] },
  { location: "Ceará (NE)", uf: "CE", coord: [-38.5267, -3.7319] },
  { location: "Bahia (NE)", uf: "BA", coord: [-38.5014, -12.9714] },
  { location: "Sergipe (NE)", uf: "SE", coord: [-37.0731, -10.9472] },

  // Norte
  { location: "Pará (NO)", uf: "PA", coord: [-48.4902, -1.4558] },
  { location: "Amazonas (NO)", uf: "AM", coord: [-60.0217, -3.1190] },
  { location: "Tocantins (NO)", uf: "TO", coord: [-48.3336, -10.1840] },
  { location: "Acre (NO)", uf: "AC", coord: [-67.8100, -9.9754] },
  { location: "Roraima (NO)", uf: "RR", coord: [-60.6753, 2.8235] },
];
