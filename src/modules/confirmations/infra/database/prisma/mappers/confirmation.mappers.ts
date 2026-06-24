import { ConfirmationReadModel } from '../../../../core/domain/read-models/confirmation/confirmation.read-model';
import {
  ConfirmationType,
  MealPeriod,
} from '../../../../core/domain/entities/confirmation';
import { MealForConfirmation } from '../../../../core/interfaces/secondary/confirmation.repository.interface';

// Converte o tipo Time do Prisma (Date em 1970-01-01 UTC) -> 'HH:mm'.
export function prismaTimeToString(time: Date): string {
  const hours = String(time.getUTCHours()).padStart(2, '0');
  const minutes = String(time.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Linha do Prisma da confirmação com a refeição incluída.
export interface ConfirmationPrismaRow {
  id: string;
  mealId: string;
  type: ConfirmationType;
  confirmedAt: Date;
  meal: { date: Date; period: MealPeriod };
}

// Linha do Prisma da refeição usada para validar prazo e capacidade.
export interface MealPrismaRow {
  id: string;
  date: Date;
  period: MealPeriod;
  endTime: Date;
  capacity: number;
}

// Converte projeção do Prisma -> read-model da confirmação do aluno.
export class ConfirmationPrismaMapper {
  static toReadModel(row: ConfirmationPrismaRow): ConfirmationReadModel {
    return new ConfirmationReadModel(
      row.id,
      row.mealId,
      row.meal.date,
      row.meal.period,
      row.type,
      row.confirmedAt,
    );
  }

  static toMealForConfirmation(row: MealPrismaRow): MealForConfirmation {
    return {
      id: row.id,
      date: row.date,
      period: row.period,
      endTime: prismaTimeToString(row.endTime),
      capacity: row.capacity,
    };
  }
}
