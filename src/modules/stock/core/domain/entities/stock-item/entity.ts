import { StockItemProps, StockStatus } from './props';

// Entidade de domínio de um item de estoque.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via StockItemBuilder.
export class StockItem {
  private constructor(private readonly props: StockItemProps) {}

  static create(props: StockItemProps): StockItem {
    return new StockItem(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get category(): string {
    return this.props.category;
  }

  get currentQuantity(): number {
    return this.props.currentQuantity;
  }

  get minQuantity(): number {
    return this.props.minQuantity;
  }

  get maxQuantity(): number {
    return this.props.maxQuantity;
  }

  get unit(): string {
    return this.props.unit;
  }

  get status(): StockStatus | undefined {
    return this.props.status;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
