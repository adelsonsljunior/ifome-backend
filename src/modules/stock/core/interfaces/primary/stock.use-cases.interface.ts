import type { InjectionToken } from '@nestjs/common';
import { StockItem, StockStatus } from '../../domain/entities/stock-item';
import {
  MovementType,
  StockMovement,
} from '../../domain/entities/stock-movement';
import { PaginationReadModel } from '../../../../../shared/domain/read-models/pagination/pagination.read-model';

// Filtro da listagem de itens: por status ou 'all' (sem filtro).
export type StockFilter = StockStatus | 'all';

// Dados de criação de um item de estoque.
export interface CreateStockItemData {
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
}

// Dados de atualização (parcial). `currentQuantity` NÃO entra aqui: toda mudança
// de quantidade passa pelo ledger de movimentações (append-only).
export interface UpdateStockItemData {
  minQuantity?: number;
  maxQuantity?: number;
  unit?: string;
}

// Dados de uma movimentação solicitada.
export interface RegisterMovementData {
  stockItemId: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
}

// Filtros do histórico de movimentações: por item e/ou período.
export interface MovementFilters {
  stockItemId?: string;
  from?: Date;
  to?: Date;
}

// Porta de entrada: casos de uso de estoque (implementados pelo StockService).
export interface IStockUseCases {
  listItems(
    filter: StockFilter,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<StockItem>>;
  getItem(id: string): Promise<StockItem>;
  createItem(data: CreateStockItemData): Promise<StockItem>;
  updateItem(id: string, data: UpdateStockItemData): Promise<void>;
  deleteItem(id: string): Promise<void>;
  registerMovement(
    data: RegisterMovementData,
    createdById: string,
  ): Promise<StockMovement>;
  listMovements(
    filters: MovementFilters,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<StockMovement>>;
}

export const STOCK_USECASES: InjectionToken<IStockUseCases> =
  Symbol('IStockUseCases');
