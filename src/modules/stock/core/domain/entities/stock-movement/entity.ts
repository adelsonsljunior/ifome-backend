import { MovementType, StockMovementProps } from './props';

// Entidade de domínio de uma movimentação de estoque (append-only).
// TypeScript puro: sem Nest, sem Prisma. Construída somente via StockMovementBuilder.
export class StockMovement {
  private constructor(private readonly props: StockMovementProps) {}

  static create(props: StockMovementProps): StockMovement {
    return new StockMovement(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get stockItemId(): string {
    return this.props.stockItemId;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get reason(): string | null | undefined {
    return this.props.reason;
  }

  get createdById(): string | null | undefined {
    return this.props.createdById;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
