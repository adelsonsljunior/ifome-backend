import { StockItem } from '../../core/domain/entities/stock-item';
import { StockMovement } from '../../core/domain/entities/stock-movement';
import { PaginationReadModel } from '../../../../shared/domain/read-models/pagination/pagination.read-model';
import { PaginationResponseDto } from '../../../../common/dto/responses/pagination-response.dto';
import { StockItemResponseDto } from '../dto/responses/stock-item-response.dto';
import { StockMovementResponseDto } from '../dto/responses/stock-movement-response.dto';

// Converte entidades de domínio -> DTOs da camada de API.
export class StockApiMapper {
  static toItemResponse(item: StockItem): StockItemResponseDto {
    return {
      id: item.id as string,
      name: item.name,
      category: item.category,
      currentQuantity: item.currentQuantity,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      unit: item.unit,
      status: item.status as StockItemResponseDto['status'],
      createdAt: (item.createdAt as Date).toISOString(),
      updatedAt: (item.updatedAt as Date).toISOString(),
    };
  }

  static toMovementResponse(movement: StockMovement): StockMovementResponseDto {
    return {
      id: movement.id as string,
      stockItemId: movement.stockItemId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason ?? null,
      createdById: movement.createdById ?? null,
      createdAt: (movement.createdAt as Date).toISOString(),
    };
  }

  static toItemPage(
    page: PaginationReadModel<StockItem>,
  ): PaginationResponseDto<StockItemResponseDto> {
    return new PaginationResponseDto(
      page.data.map((item) => this.toItemResponse(item)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }

  static toMovementPage(
    page: PaginationReadModel<StockMovement>,
  ): PaginationResponseDto<StockMovementResponseDto> {
    return new PaginationResponseDto(
      page.data.map((movement) => this.toMovementResponse(movement)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }
}
