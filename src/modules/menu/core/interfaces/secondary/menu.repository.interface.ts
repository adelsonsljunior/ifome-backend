import type { InjectionToken } from '@nestjs/common';
import { Dish, DietaryType } from '../../domain/entities/dish';
import { Meal, MealPeriod } from '../../domain/entities/meal';
import { MenuDayReadModel } from '../../domain/read-models/menu-day/menu-day.read-model';
import {
  CreateDishData,
  CreateMealData,
  UpdateDishData,
  UpdateMealData,
} from '../primary/menu.use-cases.interface';

// Porta de saída: repositório de cardápio (implementação Prisma vive em infra).
export interface IMenuRepository {
  // Cardápio público (today/week). Retorna apenas os dias com refeições no
  // intervalo [startDate, endDate]; o filtro restringe os pratos exibidos.
  findMenu(
    startDate: Date,
    endDate: Date,
    filter?: DietaryType,
  ): Promise<MenuDayReadModel[]>;

  // Catálogo de pratos.
  findDishById(id: string): Promise<Dish | null>;
  findDishesByIds(ids: string[]): Promise<Dish[]>;
  createDish(data: CreateDishData): Promise<Dish>;
  updateDish(id: string, data: UpdateDishData): Promise<Dish | null>;
  deleteDish(id: string): Promise<boolean>;

  // Refeições (cardápios agendados).
  findMealByDateAndPeriod(date: Date, period: MealPeriod): Promise<Meal | null>;
  createMeal(data: CreateMealData): Promise<Meal>;
  updateMeal(id: string, data: UpdateMealData): Promise<Meal | null>;
}

export const MENU_REPOSITORY: InjectionToken<IMenuRepository> =
  Symbol('IMenuRepository');
