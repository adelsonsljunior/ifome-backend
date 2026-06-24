import {
  ConfirmationType,
  MealPeriod,
} from '../../../../core/domain/entities/confirmation';
import { RecentConfirmationReadModel } from '../../../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';

// Linha do Prisma da confirmação com user e meal incluídos.
export interface RecentConfirmationPrismaRow {
  id: string;
  userId: string;
  type: ConfirmationType;
  confirmedAt: Date;
  user: { name: string; enrollment: string };
  meal: { date: Date; period: MealPeriod };
}

// Converte projeção do Prisma -> read-model de domínio.
export class RecentConfirmationPrismaMapper {
  static toReadModel(
    row: RecentConfirmationPrismaRow,
  ): RecentConfirmationReadModel {
    return new RecentConfirmationReadModel(
      row.id,
      row.userId,
      row.user.name,
      row.user.enrollment,
      row.meal.date,
      row.meal.period,
      row.type,
      row.confirmedAt,
    );
  }
}
