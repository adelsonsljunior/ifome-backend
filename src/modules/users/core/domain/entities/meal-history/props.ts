// Período da refeição no domínio. Espelha o enum MealPeriod do banco,
// definido aqui para manter o domínio independente do Prisma.
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

// Propriedades de um registro de histórico de refeição.
// `id` e `recordedAt` só existem após a persistência (o banco os gera).
export interface MealHistoryProps {
  id?: string;
  userId: string;
  date: Date;
  period: MealPeriod;
  dish: string;
  rating?: number | null;
  recordedAt?: Date;
}
