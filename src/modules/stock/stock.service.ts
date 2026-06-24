import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StockItem, StockItemBuilder } from './core/domain/entities/stock-item';
import {
  StockMovement,
  StockMovementBuilder,
} from './core/domain/entities/stock-movement';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import {
  CreateStockItemData,
  IStockUseCases,
  MovementFilters,
  RegisterMovementData,
  StockFilter,
  UpdateStockItemData,
} from './core/interfaces/primary/stock.use-cases.interface';
import {
  STOCK_REPOSITORY,
  type IStockRepository,
} from './core/interfaces/secondary/stock.repository.interface';
import { StockMessage } from './core/message/stock.message';
import {
  ALERT_ENGINE,
  type IAlertEngine,
} from '../alerts/core/interfaces/primary/alert-engine.interface';

@Injectable()
export class StockService implements IStockUseCases {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
    @Inject(ALERT_ENGINE)
    private readonly alertEngine: IAlertEngine,
  ) {}

  async listItems(
    filter: StockFilter,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<StockItem>> {
    const status = filter === 'all' ? undefined : filter;
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.stockRepository.findItems(
      status,
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }

  async getItem(id: string): Promise<StockItem> {
    const item = await this.stockRepository.findItemById(id);
    if (!item) {
      this.logger.warn(`Stock item ${id} not found`);
      throw new NotFoundException(StockMessage.ITEM_NOT_FOUND);
    }
    return item;
  }

  async createItem(data: CreateStockItemData): Promise<StockItem> {
    // Regra de criação: a quantidade atual deve estar entre o mínimo e o máximo.
    if (
      !(data.minQuantity < data.currentQuantity) ||
      !(data.currentQuantity < data.maxQuantity)
    ) {
      throw new BadRequestException(StockMessage.INVALID_QUANTITY_RANGE);
    }

    // Constrói para validar invariantes da entidade antes de persistir.
    new StockItemBuilder()
      .withName(data.name)
      .withCategory(data.category)
      .withCurrentQuantity(data.currentQuantity)
      .withMinQuantity(data.minQuantity)
      .withMaxQuantity(data.maxQuantity)
      .withUnit(data.unit)
      .build();

    return this.stockRepository.createItem(data);
  }

  async updateItem(id: string, data: UpdateStockItemData): Promise<void> {
    const existing = await this.getItem(id);

    // Aplica os novos limites sobre a quantidade atual e revalida mín < atual < máx.
    const minQuantity = data.minQuantity ?? existing.minQuantity;
    const maxQuantity = data.maxQuantity ?? existing.maxQuantity;
    if (minQuantity >= maxQuantity) {
      throw new BadRequestException(StockMessage.INVALID_MIN_MAX);
    }
    if (
      !(minQuantity < existing.currentQuantity) ||
      !(existing.currentQuantity < maxQuantity)
    ) {
      throw new BadRequestException(StockMessage.INVALID_QUANTITY_RANGE);
    }

    const updated = await this.stockRepository.updateItem(id, data);
    if (!updated) {
      this.logger.warn(`Stock item ${id} not found on update`);
      throw new NotFoundException(StockMessage.ITEM_NOT_FOUND);
    }
  }

  async deleteItem(id: string): Promise<void> {
    const deleted = await this.stockRepository.deleteItem(id);
    if (!deleted) {
      this.logger.warn(`Stock item ${id} not found on delete`);
      throw new NotFoundException(StockMessage.ITEM_NOT_FOUND);
    }
  }

  async registerMovement(
    data: RegisterMovementData,
    createdById: string,
  ): Promise<StockMovement> {
    const item = await this.getItem(data.stockItemId);

    // Saída não pode deixar o saldo negativo.
    if (data.type === 'saida' && data.quantity > item.currentQuantity) {
      this.logger.warn(
        `Insufficient stock for item ${item.id}: have ${item.currentQuantity}, requested ${data.quantity}`,
      );
      throw new BadRequestException(StockMessage.INSUFFICIENT_STOCK);
    }

    const movement = new StockMovementBuilder()
      .withStockItemId(data.stockItemId)
      .withType(data.type)
      .withQuantity(data.quantity)
      .withReason(data.reason)
      .withCreatedById(createdById)
      .build();

    const created = await this.stockRepository.registerMovement(movement);

    // Pós-movimentação: se o item ficou crítico (< 30% do mínimo), gera alerta.
    // Best-effort: falha na geração não invalida a movimentação já persistida.
    await this.raiseAlertIfCritical(data.stockItemId);

    return created;
  }

  private async raiseAlertIfCritical(itemId: string): Promise<void> {
    try {
      const item = await this.stockRepository.findItemById(itemId);
      if (!item || item.status !== 'crit') return;
      await this.alertEngine.raiseCriticalStockAlert({
        itemId: item.id as string,
        itemName: item.name,
        currentQuantity: item.currentQuantity,
        minQuantity: item.minQuantity,
        unit: item.unit,
      });
    } catch (err) {
      this.logger.error(
        `Failed to raise critical stock alert for item ${itemId}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  async listMovements(
    filters: MovementFilters,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<StockMovement>> {
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.stockRepository.findMovements(
      filters,
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }
}
