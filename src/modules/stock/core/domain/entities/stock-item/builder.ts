import { StockItem } from './entity';
import { StockItemProps, StockStatus } from './props';
import {
  MIN_ITEM_NAME_LENGTH,
  StockMessage,
} from '../../../message/stock.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade StockItem.
// Valida apenas invariantes sempre verdadeiros (nome, positividade, min<max);
// a regra de criação `min < atual < max` é checada no service (pode ser violada
// depois por movimentações de saída, então não pertence ao invariante da entidade).
// `id` ausente = item novo (banco gera via uuidv7()); presente = reconstrução do banco.
export class StockItemBuilder {
  private props: Partial<StockItemProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withName(name: string): this {
    this.props.name = name;
    return this;
  }

  public withCategory(category: string): this {
    this.props.category = category;
    return this;
  }

  public withCurrentQuantity(currentQuantity: number): this {
    this.props.currentQuantity = currentQuantity;
    return this;
  }

  public withMinQuantity(minQuantity: number): this {
    this.props.minQuantity = minQuantity;
    return this;
  }

  public withMaxQuantity(maxQuantity: number): this {
    this.props.maxQuantity = maxQuantity;
    return this;
  }

  public withUnit(unit: string): this {
    this.props.unit = unit;
    return this;
  }

  public withStatus(status: StockStatus): this {
    this.props.status = status;
    return this;
  }

  public withCreatedAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  public withUpdatedAt(updatedAt: Date): this {
    this.props.updatedAt = updatedAt;
    return this;
  }

  public build(): StockItem {
    if (!this.props.name || this.props.name.length < MIN_ITEM_NAME_LENGTH)
      throw new InvalidEntityException(
        'StockItem',
        StockMessage.NAME_TOO_SHORT,
      );
    if (!this.props.category)
      throw new InvalidEntityException('StockItem', 'category is required');
    if (!this.props.unit)
      throw new InvalidEntityException('StockItem', 'unit is required');
    if (
      this.props.currentQuantity === undefined ||
      this.props.currentQuantity < 0
    )
      throw new InvalidEntityException(
        'StockItem',
        StockMessage.INVALID_QUANTITY,
      );
    if (this.props.minQuantity === undefined || this.props.minQuantity <= 0)
      throw new InvalidEntityException(
        'StockItem',
        StockMessage.INVALID_QUANTITY,
      );
    if (this.props.maxQuantity === undefined || this.props.maxQuantity <= 0)
      throw new InvalidEntityException(
        'StockItem',
        StockMessage.INVALID_QUANTITY,
      );
    if (this.props.minQuantity >= this.props.maxQuantity)
      throw new InvalidEntityException(
        'StockItem',
        StockMessage.INVALID_MIN_MAX,
      );

    return StockItem.create({
      id: this.props.id, // opcional: ausente = banco gera
      name: this.props.name,
      category: this.props.category,
      currentQuantity: this.props.currentQuantity,
      minQuantity: this.props.minQuantity,
      maxQuantity: this.props.maxQuantity,
      unit: this.props.unit,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
