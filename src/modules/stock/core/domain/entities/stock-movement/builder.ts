import { StockMovement } from './entity';
import { MovementType, StockMovementProps } from './props';
import { MOVEMENT_TYPES, StockMessage } from '../../../message/stock.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade StockMovement.
// `id` ausente = movimentação nova (banco gera via uuidv7()); presente = reconstrução.
export class StockMovementBuilder {
  private props: Partial<StockMovementProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withStockItemId(stockItemId: string): this {
    this.props.stockItemId = stockItemId;
    return this;
  }

  public withType(type: MovementType): this {
    this.props.type = type;
    return this;
  }

  public withQuantity(quantity: number): this {
    this.props.quantity = quantity;
    return this;
  }

  public withReason(reason?: string | null): this {
    this.props.reason = reason;
    return this;
  }

  public withCreatedById(createdById?: string | null): this {
    this.props.createdById = createdById;
    return this;
  }

  public withCreatedAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  public build(): StockMovement {
    if (!this.props.stockItemId)
      throw new InvalidEntityException(
        'StockMovement',
        'stockItemId is required',
      );
    if (!this.props.type)
      throw new InvalidEntityException('StockMovement', 'type is required');
    if (!MOVEMENT_TYPES.includes(this.props.type))
      throw new InvalidEntityException(
        'StockMovement',
        StockMessage.INVALID_MOVEMENT_TYPE,
      );
    if (this.props.quantity === undefined || this.props.quantity <= 0)
      throw new InvalidEntityException(
        'StockMovement',
        StockMessage.INVALID_QUANTITY,
      );

    return StockMovement.create({
      id: this.props.id, // opcional: ausente = banco gera
      stockItemId: this.props.stockItemId,
      type: this.props.type,
      quantity: this.props.quantity,
      reason: this.props.reason ?? null,
      createdById: this.props.createdById ?? null,
      createdAt: this.props.createdAt,
    });
  }
}
