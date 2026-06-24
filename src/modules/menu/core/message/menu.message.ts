import type { DietaryType, DishCategory } from '../domain/entities/dish/props';
import type { MealPeriod } from '../domain/entities/meal/props';

// Mensagens e constantes do domínio de cardápio.
export const MenuMessage = {
  DISH_NOT_FOUND: 'Prato não encontrado.',
  MEAL_NOT_FOUND: 'Refeição não encontrada.',
  DISH_NAME_TOO_SHORT: 'O nome do prato deve ter ao menos 2 caracteres.',
  INVALID_CATEGORY: 'Categoria de prato inválida.',
  INVALID_DIETARY_TYPE: 'Restrição alimentar inválida.',
  INVALID_PERIOD: 'Período de refeição inválido.',
  INVALID_CAPACITY: 'A capacidade deve ser maior que zero.',
  INVALID_TIME_FORMAT: 'Horário inválido. Use o formato HH:mm.',
  INVALID_TIME_RANGE: 'O horário final deve ser posterior ao inicial.',
  DATE_NOT_IN_FUTURE: 'A data da refeição deve estar no futuro.',
  MEAL_ALREADY_EXISTS:
    'Já existe uma refeição agendada para esta data e período.',
  DISHES_NOT_FOUND: 'Um ou mais pratos informados não existem.',
  DISH_IN_USE:
    'Não é possível remover um prato que está em uma refeição agendada.',
} as const;

// Tamanho mínimo do nome do prato.
export const MIN_DISH_NAME_LENGTH = 2;

// Formato aceito de horário: HH:mm (00:00–23:59).
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Valores válidos espelhando os enums do banco; reusados por builders e DTOs.
export const DISH_CATEGORIES: readonly DishCategory[] = [
  'base',
  'protein',
  'proteinVeg',
  'salad',
  'side',
  'dessert',
  'beverage',
];

export const DIETARY_TYPES: readonly DietaryType[] = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'lactoseFree',
  'spicy',
];

export const MEAL_PERIODS: readonly MealPeriod[] = [
  'breakfast',
  'lunch',
  'dinner',
];
