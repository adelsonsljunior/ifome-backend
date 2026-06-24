import {
  MealHistory,
  MealHistoryBuilder,
  MealPeriod,
} from '../../../../core/domain/entities/meal-history';

// Linha do Prisma do histórico de refeição.
export interface MealHistoryPrismaRow {
  id: string;
  userId: string;
  date: Date;
  period: MealPeriod;
  dish: string;
  rating: number | null;
  recordedAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class MealHistoryPrismaMapper {
  static toDomain(row: MealHistoryPrismaRow): MealHistory {
    return new MealHistoryBuilder()
      .withId(row.id)
      .withUserId(row.userId)
      .withDate(row.date)
      .withPeriod(row.period)
      .withDish(row.dish)
      .withRating(row.rating)
      .withRecordedAt(row.recordedAt)
      .build();
  }
}
