import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  StockItem,
  StockStatus,
} from '../../../core/domain/entities/stock-item';
import { StockMovement } from '../../../core/domain/entities/stock-movement';
import {
  IStockRepository,
  PagedResult,
} from '../../../core/interfaces/secondary/stock.repository.interface';
import {
  CreateStockItemData,
  MovementFilters,
  UpdateStockItemData,
} from '../../../core/interfaces/primary/stock.use-cases.interface';
import {
  StockItemPrismaMapper,
  statusToPrisma,
} from '../prisma/mappers/stock-item.mappers';
import {
  StockMovementPrismaMapper,
  typeToPrisma,
} from '../prisma/mappers/stock-movement.mappers';

// Extrai o código de erro conhecido do Prisma (ex.: P2025) sem acoplar o tipo do client.
function prismaErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

// Implementação Prisma do repositório de estoque.
// Único ponto do módulo que acessa o PrismaService.
// O campo `status` nunca é escrito pela aplicação: o trigger trg_set_stock_status
// o calcula no banco a cada INSERT/UPDATE de currentQuantity/minQuantity.
@Injectable()
export class StockRepository implements IStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findItems(
    status: StockStatus | undefined,
    skip: number,
    take: number,
  ): Promise<PagedResult<StockItem>> {
    const where = status ? { status: statusToPrisma(status) } : undefined;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.stockItem.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    return {
      rows: rows.map((row) => StockItemPrismaMapper.toDomain(row)),
      total,
    };
  }

  async findItemById(id: string): Promise<StockItem | null> {
    const row = await this.prisma.stockItem.findUnique({ where: { id } });
    return row ? StockItemPrismaMapper.toDomain(row) : null;
  }

  async createItem(data: CreateStockItemData): Promise<StockItem> {
    const row = await this.prisma.stockItem.create({
      // não envia `id` (uuidv7()) nem `status` (trigger).
      data: {
        name: data.name,
        category: data.category,
        currentQuantity: data.currentQuantity,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        unit: data.unit,
      },
    });
    return StockItemPrismaMapper.toDomain(row);
  }

  async updateItem(
    id: string,
    data: UpdateStockItemData,
  ): Promise<StockItem | null> {
    try {
      const row = await this.prisma.stockItem.update({
        where: { id },
        // não escreve `status`: o trigger recalcula ao mudar minQuantity.
        data: {
          ...(data.minQuantity !== undefined && {
            minQuantity: data.minQuantity,
          }),
          ...(data.maxQuantity !== undefined && {
            maxQuantity: data.maxQuantity,
          }),
          ...(data.unit !== undefined && { unit: data.unit }),
        },
      });
      return StockItemPrismaMapper.toDomain(row);
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return null; // não encontrado
      throw error;
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      await this.prisma.stockItem.delete({ where: { id } });
      return true;
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return false; // não encontrado
      throw error;
    }
  }

  async registerMovement(movement: StockMovement): Promise<StockMovement> {
    // Entrada soma, saída subtrai. O incremento negativo ajusta o saldo e
    // dispara o trigger que recalcula o status.
    const delta =
      movement.type === 'entrada' ? movement.quantity : -movement.quantity;

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.stockItem.update({
        where: { id: movement.stockItemId },
        data: { currentQuantity: { increment: delta } },
      });
      return tx.stockMovement.create({
        // não envia `id`: o banco gera via uuidv7().
        data: {
          stockItemId: movement.stockItemId,
          type: typeToPrisma(movement.type),
          quantity: movement.quantity,
          reason: movement.reason ?? null,
          createdById: movement.createdById ?? null,
        },
      });
    });

    return StockMovementPrismaMapper.toDomain(row);
  }

  async findMovements(
    filters: MovementFilters,
    skip: number,
    take: number,
  ): Promise<PagedResult<StockMovement>> {
    const { stockItemId, from, to } = filters;
    const where = {
      ...(stockItemId && { stockItemId }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      rows: rows.map((row) => StockMovementPrismaMapper.toDomain(row)),
      total,
    };
  }
}
