import { ConfirmationType, MealPeriod } from '../../entities/confirmation';

// Read-model de leitura para o painel do admin: projeção que junta
// Confirmation + Meal + User. Read-only; não é uma entidade de escrita.
export class RecentConfirmationReadModel {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly userEnrollment: string,
    public readonly mealDate: Date,
    public readonly mealPeriod: MealPeriod,
    public readonly type: ConfirmationType,
    public readonly confirmedAt: Date,
  ) {}
}
