import { MealPeriod } from '../../entities/confirmation';

// Ponto de demanda: confirmações ativas de uma refeição (data + período).
// Agregado ao vivo das confirmações (canceledAt = null); read-only.
export class DemandPoint {
  constructor(
    public readonly date: Date,
    public readonly period: MealPeriod,
    public readonly count: number,
  ) {}
}
