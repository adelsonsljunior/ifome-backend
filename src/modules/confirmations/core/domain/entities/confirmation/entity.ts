import { ConfirmationProps, ConfirmationType } from './props';

// Entidade de domínio de uma confirmação de presença em uma refeição.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via ConfirmationBuilder.
export class Confirmation {
  private constructor(private readonly props: ConfirmationProps) {}

  static create(props: ConfirmationProps): Confirmation {
    return new Confirmation(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get mealId(): string {
    return this.props.mealId;
  }

  get type(): ConfirmationType {
    return this.props.type;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }
}
