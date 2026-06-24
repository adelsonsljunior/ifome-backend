// Tipo de movimentação no domínio: entrada (inbound) ou saída (outbound).
// Espelha o enum StockMovementType do banco; a conversão acontece na borda.
export type MovementType = 'entrada' | 'saida';

// Propriedades de uma movimentação de estoque (registro append-only).
// `id`, `createdAt` só existem após a persistência; `createdById` é o admin autor.
export interface StockMovementProps {
  id?: string;
  stockItemId: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  createdById?: string | null;
  createdAt?: Date;
}
