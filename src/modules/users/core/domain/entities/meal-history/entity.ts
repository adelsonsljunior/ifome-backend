import { MealHistoryProps, MealPeriod } from './props';

// Entidade de domínio de um registro de histórico de refeição.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via MealHistoryBuilder.
export class MealHistory {
  private constructor(private readonly props: MealHistoryProps) {}

  static create(props: MealHistoryProps): MealHistory {
    return new MealHistory(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get date(): Date {
    return this.props.date;
  }

  get period(): MealPeriod {
    return this.props.period;
  }

  get dish(): string {
    return this.props.dish;
  }

  get rating(): number | null {
    return this.props.rating ?? null;
  }

  get recordedAt(): Date | undefined {
    return this.props.recordedAt;
  }
}
