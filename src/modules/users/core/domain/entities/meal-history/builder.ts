import { MealHistory } from './entity';
import { MealHistoryProps, MealPeriod } from './props';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade MealHistory.
// `id` ausente = registro novo (o banco gera via uuidv7()); presente = reconstrução do banco.
export class MealHistoryBuilder {
  private props: Partial<MealHistoryProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withUserId(userId: string): this {
    this.props.userId = userId;
    return this;
  }

  public withDate(date: Date): this {
    this.props.date = date;
    return this;
  }

  public withPeriod(period: MealPeriod): this {
    this.props.period = period;
    return this;
  }

  public withDish(dish: string): this {
    this.props.dish = dish;
    return this;
  }

  public withRating(rating?: number | null): this {
    this.props.rating = rating;
    return this;
  }

  public withRecordedAt(recordedAt: Date): this {
    this.props.recordedAt = recordedAt;
    return this;
  }

  public build(): MealHistory {
    if (!this.props.userId)
      throw new InvalidEntityException('MealHistory', 'userId is required');
    if (!this.props.date)
      throw new InvalidEntityException('MealHistory', 'date is required');
    if (!this.props.period)
      throw new InvalidEntityException('MealHistory', 'period is required');
    if (!this.props.dish)
      throw new InvalidEntityException('MealHistory', 'dish is required');

    return MealHistory.create({
      id: this.props.id,
      userId: this.props.userId,
      date: this.props.date,
      period: this.props.period,
      dish: this.props.dish,
      rating: this.props.rating ?? null,
      recordedAt: this.props.recordedAt,
    });
  }
}
