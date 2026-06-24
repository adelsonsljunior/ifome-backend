import { DietaryType, DishCategory, DishProps } from './props';

// Entidade de domínio de um prato do catálogo.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via DishBuilder.
export class Dish {
  private constructor(private readonly props: DishProps) {}

  static create(props: DishProps): Dish {
    return new Dish(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): DishCategory {
    return this.props.category;
  }

  get active(): boolean {
    return this.props.active;
  }

  get restrictions(): DietaryType[] {
    return this.props.restrictions;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
