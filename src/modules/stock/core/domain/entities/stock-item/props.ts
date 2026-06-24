// Status de criticidade do item no domínio. Espelha o enum StockStatus do banco,
// porém com 'crit' no lugar de 'critical' (vocabulário da API). A conversão
// acontece na borda (mappers). É calculado pelo trigger do banco, nunca pela app.
export type StockStatus = 'ok' | 'low' | 'crit';

// Propriedades de um item de estoque.
// `currentQuantity/min/max` são números no domínio (Decimal no banco).
// `status` vem do trigger; ausente em um item novo ainda não persistido.
// `id`, `createdAt`, `updatedAt` só existem após a persistência.
export interface StockItemProps {
  id?: string;
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  status?: StockStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
