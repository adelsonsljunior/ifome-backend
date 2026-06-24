import { ConfirmationType, MealPeriod } from '../../entities/confirmation';

// Read-model da confirmação do aluno (rotas /today e POST): projeção que junta
// Confirmation + Meal para devolver o período e a data da refeição. Read-only.
export class ConfirmationReadModel {
  constructor(
    public readonly id: string,
    public readonly mealId: string,
    public readonly mealDate: Date,
    public readonly mealPeriod: MealPeriod,
    public readonly type: ConfirmationType,
    public readonly confirmedAt: Date,
  ) {}
}
