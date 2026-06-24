import { DietaryType, DishCategory } from '../../entities/dish';
import { MealPeriod } from '../../entities/meal';

// Projeção de leitura de um prato dentro de uma refeição do cardápio público.
export class DishView {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: DishCategory,
    public readonly restrictions: DietaryType[],
  ) {}
}

// Projeção de leitura de uma refeição com os números de ocupação.
// `confirmedCount` é derivado das confirmações ativas; `usagePercent` é calculado.
export class MealView {
  public readonly usagePercent: number;

  constructor(
    public readonly id: string,
    public readonly period: MealPeriod,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly capacity: number,
    public readonly confirmedCount: number,
    public readonly dishes: DishView[],
  ) {
    this.usagePercent =
      capacity > 0 ? Math.round((confirmedCount / capacity) * 100) : 0;
  }
}

// Read-model do cardápio de um dia: a data + as refeições do dia.
// Read-only; não é uma entidade de escrita.
export class MenuDayReadModel {
  constructor(
    public readonly date: Date,
    public readonly meals: MealView[],
  ) {}
}
