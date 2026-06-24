import type {
  ConfirmationType,
  MealPeriod,
} from '../domain/entities/confirmation/props';

// Mensagens e constantes do domínio de confirmações de refeição.
export const ConfirmationMessage = {
  MEAL_NOT_FOUND: 'Não há refeição agendada para este período hoje.',
  DEADLINE_PASSED: 'O prazo de confirmação desta refeição já encerrou.',
  CAPACITY_EXHAUSTED: 'A capacidade desta refeição está esgotada.',
  INVALID_TYPE: 'Tipo de confirmação inválido.',
  INVALID_PERIOD: 'Período de refeição inválido.',
  NO_CONFIRMATION_TODAY: 'Você não possui confirmação para hoje.',
} as const;

// Valores válidos espelhando os enums do banco; reusados por builders e DTOs.
export const CONFIRMATION_TYPES: readonly ConfirmationType[] = [
  'standard',
  'adapted',
];

export const MEAL_PERIODS: readonly MealPeriod[] = [
  'breakfast',
  'lunch',
  'dinner',
];
