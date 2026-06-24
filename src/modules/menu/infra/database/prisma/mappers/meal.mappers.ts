import {
  Meal,
  MealBuilder,
  MealPeriod,
} from '../../../../core/domain/entities/meal';

// Linha do Prisma de uma refeição. `dishes` só vem quando a query inclui a relação.
export interface MealPrismaRow {
  id: string;
  date: Date;
  period: MealPeriod;
  startTime: Date;
  endTime: Date;
  capacity: number;
  dishes?: { dishId: string; order: number }[];
  createdAt: Date;
  updatedAt: Date;
}

// Converte o tipo Time do Prisma (Date em 1970-01-01) -> 'HH:mm'.
export function prismaTimeToString(time: Date): string {
  const hours = String(time.getUTCHours()).padStart(2, '0');
  const minutes = String(time.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Converte 'HH:mm' -> Date no epoch (1970-01-01) para gravar em coluna Time.
export function stringToPrismaTime(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

// Converte 'YYYY-MM-DD' -> Date em meia-noite UTC para gravar em coluna Date.
export function stringToPrismaDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

// Converte modelo do Prisma -> entidade de domínio.
export class MealPrismaMapper {
  static toDomain(row: MealPrismaRow): Meal {
    return new MealBuilder()
      .withId(row.id)
      .withDate(row.date)
      .withPeriod(row.period)
      .withStartTime(prismaTimeToString(row.startTime))
      .withEndTime(prismaTimeToString(row.endTime))
      .withCapacity(row.capacity)
      .withDishes(
        row.dishes?.map((dish) => ({ dishId: dish.dishId, order: dish.order })),
      )
      .withCreatedAt(row.createdAt)
      .withUpdatedAt(row.updatedAt)
      .build();
  }
}
