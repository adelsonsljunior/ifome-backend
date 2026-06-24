import {
  MovementType,
  StockMovement,
  StockMovementBuilder,
} from '../../../../core/domain/entities/stock-movement';

// Decimal do Prisma (decimal.js): expõe toNumber().
type DecimalLike = { toNumber(): number };

// Tipo do banco (inbound|outbound|adjustment) -> tipo do domínio (entrada|saida).
export function typeToDomain(
  type: 'inbound' | 'outbound' | 'adjustment',
): MovementType {
  return type === 'inbound' ? 'entrada' : 'saida';
}

// Tipo do domínio -> tipo do banco.
export function typeToPrisma(type: MovementType): 'inbound' | 'outbound' {
  return type === 'entrada' ? 'inbound' : 'outbound';
}

// Linha do Prisma de uma movimentação.
export interface StockMovementPrismaRow {
  id: string;
  stockItemId: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: DecimalLike;
  reason: string | null;
  createdById: string | null;
  createdAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class StockMovementPrismaMapper {
  static toDomain(row: StockMovementPrismaRow): StockMovement {
    return new StockMovementBuilder()
      .withId(row.id)
      .withStockItemId(row.stockItemId)
      .withType(typeToDomain(row.type))
      .withQuantity(row.quantity.toNumber())
      .withReason(row.reason)
      .withCreatedById(row.createdById)
      .withCreatedAt(row.createdAt)
      .build();
  }
}
