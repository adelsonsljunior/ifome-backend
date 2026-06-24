import type { InjectionToken } from '@nestjs/common';
import { Dish, DietaryType, DishCategory } from '../../domain/entities/dish';
import { Meal, MealDishItem, MealPeriod } from '../../domain/entities/meal';
import { MenuDayReadModel } from '../../domain/read-models/menu-day/menu-day.read-model';

// Dados para criar um prato.
export interface CreateDishData {
  name: string;
  description: string;
  category: DishCategory;
  restrictions: DietaryType[];
}

// Dados para atualizar um prato. Campos ausentes não são alterados;
// `restrictions` presente (mesmo vazio) substitui o conjunto.
export interface UpdateDishData {
  name?: string;
  description?: string;
  category?: DishCategory;
  restrictions?: DietaryType[];
}

// Dados para agendar uma refeição. `date` no formato 'YYYY-MM-DD';
// `startTime`/`endTime` no formato 'HH:mm'.
export interface CreateMealData {
  date: string;
  period: MealPeriod;
  startTime: string;
  endTime: string;
  capacity: number;
  dishes: MealDishItem[];
}

// Dados para atualizar uma refeição. Campos ausentes não são alterados;
// `dishes` presente substitui o conjunto de pratos da refeição.
export interface UpdateMealData {
  capacity?: number;
  endTime?: string;
  dishes?: MealDishItem[];
}

// Porta de entrada: casos de uso de cardápio (implementados pelo MenuService).
export interface IMenuUseCases {
  getToday(): Promise<MenuDayReadModel>;
  getWeek(filter?: DietaryType): Promise<MenuDayReadModel[]>;
  getDishById(id: string): Promise<Dish>;
  createDish(data: CreateDishData): Promise<Dish>;
  updateDish(id: string, data: UpdateDishData): Promise<Dish>;
  deleteDish(id: string): Promise<void>;
  createMeal(data: CreateMealData): Promise<Meal>;
  updateMeal(id: string, data: UpdateMealData): Promise<Meal>;
}

export const MENU_USECASES: InjectionToken<IMenuUseCases> =
  Symbol('IMenuUseCases');
