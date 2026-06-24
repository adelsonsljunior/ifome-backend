import {
  StockItem,
  StockItemBuilder,
  StockStatus,
} from '../../../../core/domain/entities/stock-item';

// Decimal do Prisma (decimal.js): expõe toNumber(). Evita acoplar o tipo do client.
type DecimalLike = { toNumber(): number };

// Status do banco -> status do domínio ('critical' vira 'crit').
const DB_TO_DOMAIN_STATUS: Record<string, StockStatus> = {
  ok: 'ok',
  low: 'low',
  critical: 'crit',
};

// Status do domínio -> status do banco (para filtros em where).
const DOMAIN_TO_DB_STATUS: Record<StockStatus, 'ok' | 'low' | 'critical'> = {
  ok: 'ok',
  low: 'low',
  crit: 'critical',
};

export function statusToPrisma(status: StockStatus): 'ok' | 'low' | 'critical' {
  return DOMAIN_TO_DB_STATUS[status];
}

// Linha do Prisma de um item de estoque.
export interface StockItemPrismaRow {
  id: string;
  name: string;
  category: string;
  currentQuantity: DecimalLike;
  minQuantity: DecimalLike;
  maxQuantity: DecimalLike;
  unit: string;
  status: 'ok' | 'low' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class StockItemPrismaMapper {
  static toDomain(row: StockItemPrismaRow): StockItem {
    return new StockItemBuilder()
      .withId(row.id)
      .withName(row.name)
      .withCategory(row.category)
      .withCurrentQuantity(row.currentQuantity.toNumber())
      .withMinQuantity(row.minQuantity.toNumber())
      .withMaxQuantity(row.maxQuantity.toNumber())
      .withUnit(row.unit)
      .withStatus(DB_TO_DOMAIN_STATUS[row.status])
      .withCreatedAt(row.createdAt)
      .withUpdatedAt(row.updatedAt)
      .build();
  }
}
