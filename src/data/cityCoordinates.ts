/**
 * Reference coordinates (approximate municipal seats, IBGE/WGS84) used when a
 * record has no latitude/longitude of its own. Keyed by "UF|normalized city".
 * Cities not listed here are intentionally NOT positioned on the map.
 */
export interface CityRef {
  city: string;
  uf: string;
  lat: number;
  lng: number;
}

export const CITY_REFERENCES: CityRef[] = [
  { city: "São Paulo", uf: "SP", lat: -23.5505, lng: -46.6333 },
  { city: "Campinas", uf: "SP", lat: -22.9056, lng: -47.0608 },
  { city: "Santos", uf: "SP", lat: -23.9608, lng: -46.3336 },
  { city: "Ribeirão Preto", uf: "SP", lat: -21.1775, lng: -47.8103 },
  { city: "Sorocaba", uf: "SP", lat: -23.5015, lng: -47.4526 },
  { city: "São José dos Campos", uf: "SP", lat: -23.1896, lng: -45.8841 },
  { city: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729 },
  { city: "Niterói", uf: "RJ", lat: -22.8832, lng: -43.1034 },
  { city: "Campos dos Goytacazes", uf: "RJ", lat: -21.7545, lng: -41.3244 },
  { city: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345 },
  { city: "Uberlândia", uf: "MG", lat: -18.9186, lng: -48.2772 },
  { city: "Juiz de Fora", uf: "MG", lat: -21.7642, lng: -43.3503 },
  { city: "Contagem", uf: "MG", lat: -19.9317, lng: -44.0536 },
  { city: "Curitiba", uf: "PR", lat: -25.4284, lng: -49.2733 },
  { city: "Londrina", uf: "PR", lat: -23.3045, lng: -51.1696 },
  { city: "Maringá", uf: "PR", lat: -23.4205, lng: -51.9333 },
  { city: "Cascavel", uf: "PR", lat: -24.9555, lng: -53.4552 },
  { city: "Florianópolis", uf: "SC", lat: -27.5954, lng: -48.548 },
  { city: "Joinville", uf: "SC", lat: -26.3045, lng: -48.8487 },
  { city: "Blumenau", uf: "SC", lat: -26.9194, lng: -49.0661 },
  { city: "Porto Alegre", uf: "RS", lat: -30.0346, lng: -51.2177 },
  { city: "Caxias do Sul", uf: "RS", lat: -29.1678, lng: -51.1794 },
  { city: "Pelotas", uf: "RS", lat: -31.7654, lng: -52.3376 },
  { city: "Salvador", uf: "BA", lat: -12.9777, lng: -38.5016 },
  { city: "Feira de Santana", uf: "BA", lat: -12.2664, lng: -38.9663 },
  { city: "Vitória da Conquista", uf: "BA", lat: -14.8615, lng: -40.8442 },
  { city: "Recife", uf: "PE", lat: -8.0476, lng: -34.877 },
  { city: "Caruaru", uf: "PE", lat: -8.2846, lng: -35.9699 },
  { city: "Petrolina", uf: "PE", lat: -9.3891, lng: -40.503 },
  { city: "Fortaleza", uf: "CE", lat: -3.7319, lng: -38.5267 },
  { city: "Juazeiro do Norte", uf: "CE", lat: -7.2131, lng: -39.3151 },
  { city: "Goiânia", uf: "GO", lat: -16.6869, lng: -49.2648 },
  { city: "Anápolis", uf: "GO", lat: -16.3281, lng: -48.9534 },
  { city: "Rio Verde", uf: "GO", lat: -17.7923, lng: -50.9192 },
  { city: "Brasília", uf: "DF", lat: -15.7939, lng: -47.8828 },
  { city: "Cuiabá", uf: "MT", lat: -15.601, lng: -56.0974 },
  { city: "Rondonópolis", uf: "MT", lat: -16.4673, lng: -54.6372 },
  { city: "Sinop", uf: "MT", lat: -11.8604, lng: -55.5091 },
  { city: "Campo Grande", uf: "MS", lat: -20.4697, lng: -54.6201 },
  { city: "Dourados", uf: "MS", lat: -22.2211, lng: -54.8056 },
  { city: "Vitória", uf: "ES", lat: -20.3155, lng: -40.3128 },
  { city: "Vila Velha", uf: "ES", lat: -20.3297, lng: -40.2925 },
  { city: "Manaus", uf: "AM", lat: -3.119, lng: -60.0217 },
  { city: "Belém", uf: "PA", lat: -1.4558, lng: -48.4902 },
  { city: "Santarém", uf: "PA", lat: -2.4385, lng: -54.6996 },
  { city: "São Luís", uf: "MA", lat: -2.5307, lng: -44.3068 },
  { city: "Imperatriz", uf: "MA", lat: -5.5185, lng: -47.4777 },
  { city: "João Pessoa", uf: "PB", lat: -7.1195, lng: -34.845 },
  { city: "Campina Grande", uf: "PB", lat: -7.2307, lng: -35.8811 },
  { city: "Natal", uf: "RN", lat: -5.7945, lng: -35.211 },
  { city: "Mossoró", uf: "RN", lat: -5.1878, lng: -37.3442 },
  { city: "Maceió", uf: "AL", lat: -9.6658, lng: -35.735 },
  { city: "Aracaju", uf: "SE", lat: -10.9472, lng: -37.0731 },
  { city: "Teresina", uf: "PI", lat: -5.0919, lng: -42.8034 },
  { city: "Palmas", uf: "TO", lat: -10.1844, lng: -48.3336 },
];
