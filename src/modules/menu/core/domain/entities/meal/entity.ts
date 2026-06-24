import { MealDishItem, MealPeriod, MealProps } from './props';

// Entidade de domínio de uma refeição (cardápio diário de um período).
// TypeScript puro: sem Nest, sem Prisma. Construída somente via MealBuilder.
export class Meal {
  private constructor(private readonly props: MealProps) {}

  static create(props: MealProps): Meal {
    return new Meal(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get date(): Date {
    return this.props.date;
  }

  get period(): MealPeriod {
    return this.props.period;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get endTime(): string {
    return this.props.endTime;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get dishes(): MealDishItem[] {
    return this.props.dishes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
