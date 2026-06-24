import { Meal } from './entity';
import { MealDishItem, MealPeriod, MealProps } from './props';
import {
  MEAL_PERIODS,
  MenuMessage,
  TIME_REGEX,
} from '../../../message/menu.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade Meal.
// `id` ausente = refeição nova (o banco gera via uuidv7()); presente = reconstrução do banco.
export class MealBuilder {
  private props: Partial<MealProps> = {};

  public withId(id: string): this {
    this.props.id = id;
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

  public withStartTime(startTime: string): this {
    this.props.startTime = startTime;
    return this;
  }

  public withEndTime(endTime: string): this {
    this.props.endTime = endTime;
    return this;
  }

  public withCapacity(capacity: number): this {
    this.props.capacity = capacity;
    return this;
  }

  public withDishes(dishes?: MealDishItem[]): this {
    this.props.dishes = dishes;
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

  public build(): Meal {
    if (!this.props.date)
      throw new InvalidEntityException('Meal', 'date is required');
    if (!this.props.period)
      throw new InvalidEntityException('Meal', 'period is required');
    if (!MEAL_PERIODS.includes(this.props.period))
      throw new InvalidEntityException('Meal', MenuMessage.INVALID_PERIOD);
    if (!this.props.startTime || !TIME_REGEX.test(this.props.startTime))
      throw new InvalidEntityException('Meal', MenuMessage.INVALID_TIME_FORMAT);
    if (!this.props.endTime || !TIME_REGEX.test(this.props.endTime))
      throw new InvalidEntityException('Meal', MenuMessage.INVALID_TIME_FORMAT);
    if (this.props.endTime <= this.props.startTime)
      throw new InvalidEntityException('Meal', MenuMessage.INVALID_TIME_RANGE);
    if (this.props.capacity === undefined || this.props.capacity === null)
      throw new InvalidEntityException('Meal', 'capacity is required');
    if (this.props.capacity <= 0)
      throw new InvalidEntityException('Meal', MenuMessage.INVALID_CAPACITY);

    return Meal.create({
      id: this.props.id, // opcional: ausente = banco gera
      date: this.props.date,
      period: this.props.period,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      capacity: this.props.capacity,
      dishes: this.props.dishes ?? [],
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
