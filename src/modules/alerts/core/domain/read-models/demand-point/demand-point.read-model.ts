// Período da demanda. Espelha o enum MealPeriod do banco.
export type DemandPeriod = 'breakfast' | 'lunch' | 'dinner';

// Read-model de um ponto de demanda passada (uma linha de DemandAnalytics):
// total de confirmações de um período em uma data. Read-only.
export class DemandPointReadModel {
  constructor(
    public readonly date: Date,
    public readonly period: DemandPeriod,
    public readonly count: number,
  ) {}
}
