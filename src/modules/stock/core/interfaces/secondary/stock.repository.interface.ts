import type { InjectionToken } from '@nestjs/common';
import { StockItem, StockStatus } from '../../domain/entities/stock-item';
import { StockMovement } from '../../domain/entities/stock-movement';
import {
  CreateStockItemData,
  MovementFilters,
  UpdateStockItemData,
} from '../primary/stock.use-cases.interface';

// Resultado paginado cru do repositório: a página de itens + o total geral.
export interface PagedResult<T> {
  rows: T[];
  total: number;
}

// Porta de saída: repositório de estoque (implementação Prisma vive em infra).
export interface IStockRepository {
  // Itens paginados. `status` ausente = sem filtro.
  findItems(
    status: StockStatus | undefined,
    skip: number,
    take: number,
  ): Promise<PagedResult<StockItem>>;
  findItemById(id: string): Promise<StockItem | null>;
  createItem(data: CreateStockItemData): Promise<StockItem>;
  updateItem(id: string, data: UpdateStockItemData): Promise<StockItem | null>;
  deleteItem(id: string): Promise<boolean>;

  // Registra a movimentação (append-only) e ajusta a quantidade do item numa
  // transação; o status é recalculado pelo trigger do banco.
  registerMovement(movement: StockMovement): Promise<StockMovement>;

  // Histórico de movimentações paginado, filtrado por item e/ou período.
  findMovements(
    filters: MovementFilters,
    skip: number,
    take: number,
  ): Promise<PagedResult<StockMovement>>;
}

export const STOCK_REPOSITORY: InjectionToken<IStockRepository> =
  Symbol('IStockRepository');
