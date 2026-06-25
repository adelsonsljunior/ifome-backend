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

// Prazo de confirmação por período: horário limite ('HH:mm' UTC) até o qual o
// aluno pode confirmar/cancelar, sempre antes do início da refeição.
//   café da manhã 07:00–08:00 -> até 05:30
//   almoço        11:30–12:30 -> até 10:00
//   jantar        18:00–19:00 -> até 16:00
export const CONFIRMATION_DEADLINES: Record<MealPeriod, string> = {
  breakfast: '05:30',
  lunch: '10:00',
  dinner: '16:00',
};
