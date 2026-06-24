// Período da refeição no domínio. Espelha o enum MealPeriod do banco,
// definido aqui para manter o domínio independente do Prisma.
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

// Item da associação refeição <-> prato: referência do prato + ordem de exibição.
export interface MealDishItem {
  dishId: string;
  order: number;
}

// Propriedades de uma refeição (cardápio de um período em um dia).
// `startTime`/`endTime` são strings no formato 'HH:mm' no domínio; a conversão
// de/para o tipo Time do banco acontece na borda (infra).
// `id`, `createdAt` e `updatedAt` só existem após a persistência.
export interface MealProps {
  id?: string;
  date: Date;
  period: MealPeriod;
  startTime: string;
  endTime: string;
  capacity: number;
  dishes: MealDishItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
