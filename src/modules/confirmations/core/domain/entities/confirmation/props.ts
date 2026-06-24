// Tipo de confirmação no domínio. Espelha o enum ConfirmationType do banco
// (standard = padrão, adapted = adaptada), definido aqui para manter o domínio
// independente do Prisma.
export type ConfirmationType = 'standard' | 'adapted';

// Período da refeição no domínio. Espelha o enum MealPeriod do banco.
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

// Propriedades de uma confirmação de presença em uma refeição.
// `id` e `confirmedAt` só existem após a persistência.
export interface ConfirmationProps {
  id?: string;
  userId: string;
  mealId: string;
  type: ConfirmationType;
  confirmedAt?: Date;
}
