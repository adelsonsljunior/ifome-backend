import {
  DietaryType,
  DishCategory,
} from '../../../../core/domain/entities/dish';
import { MealPeriod } from '../../../../core/domain/entities/meal';
import {
  DishView,
  MealView,
  MenuDayReadModel,
} from '../../../../core/domain/read-models/menu-day/menu-day.read-model';
import { prismaTimeToString } from './meal.mappers';

// Linha do Prisma de uma refeição com pratos e contagem de confirmados ativos.
export interface MenuMealPrismaRow {
  id: string;
  date: Date;
  period: MealPeriod;
  startTime: Date;
  endTime: Date;
  capacity: number;
  _count: { confirmations: number };
  dishes: {
    dish: {
      id: string;
      name: string;
      description: string;
      category: DishCategory;
      restrictions: { type: DietaryType }[];
    };
  }[];
}

// Chave de agrupamento por data (YYYY-MM-DD). A coluna é @db.Date (meia-noite UTC).
const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

// Converte as linhas de refeição (ordenadas por data) em read-models por dia.
export class MenuDayPrismaMapper {
  static toReadModels(rows: MenuMealPrismaRow[]): MenuDayReadModel[] {
    const byDay = new Map<string, { date: Date; meals: MealView[] }>();

    for (const row of rows) {
      const key = dateKey(row.date);
      if (!byDay.has(key)) byDay.set(key, { date: row.date, meals: [] });

      const dishes = row.dishes.map(
        ({ dish }) =>
          new DishView(
            dish.id,
            dish.name,
            dish.description,
            dish.category,
            dish.restrictions.map((restriction) => restriction.type),
          ),
      );

      byDay
        .get(key)!
        .meals.push(
          new MealView(
            row.id,
            row.period,
            prismaTimeToString(row.startTime),
            prismaTimeToString(row.endTime),
            row.capacity,
            row._count.confirmations,
            dishes,
          ),
        );
    }

    return Array.from(byDay.values()).map(
      ({ date, meals }) => new MenuDayReadModel(date, meals),
    );
  }
}
