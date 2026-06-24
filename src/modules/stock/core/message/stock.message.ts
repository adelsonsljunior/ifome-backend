import type { StockStatus } from '../domain/entities/stock-item/props';
import type { MovementType } from '../domain/entities/stock-movement/props';

// Mensagens e constantes do domínio de estoque.
export const StockMessage = {
  ITEM_NOT_FOUND: 'Item de estoque não encontrado.',
  NAME_TOO_SHORT: 'O nome do item deve ter ao menos 2 caracteres.',
  INVALID_QUANTITY: 'As quantidades devem ser maiores que zero.',
  INVALID_QUANTITY_RANGE:
    'A quantidade atual deve estar entre o mínimo e o máximo (mín < atual < máx).',
  INVALID_MIN_MAX: 'O mínimo deve ser menor que o máximo.',
  INVALID_MOVEMENT_TYPE: 'Tipo de movimentação inválido.',
  INSUFFICIENT_STOCK: 'Saldo insuficiente para a saída solicitada.',
} as const;

// Tamanho mínimo do nome do item.
export const MIN_ITEM_NAME_LENGTH = 2;

// Valores válidos espelhando os enums do banco; reusados por DTOs e mappers.
export const STOCK_STATUSES: readonly StockStatus[] = ['ok', 'low', 'crit'];

export const MOVEMENT_TYPES: readonly MovementType[] = ['entrada', 'saida'];
