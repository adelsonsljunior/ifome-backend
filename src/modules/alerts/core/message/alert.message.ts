import type { AlertLevel, AlertType } from '../domain/entities/alert/props';

// Mensagens e constantes do domínio de alertas.
export const AlertMessage = {
  NOT_FOUND: 'Alerta não encontrado.',
  INVALID_LEVEL: 'Nível de alerta inválido.',
  INVALID_TYPE: 'Tipo de alerta inválido.',
} as const;

// Valores válidos espelhando os enums do banco; reusados por builders e DTOs.
export const ALERT_LEVELS: readonly AlertLevel[] = ['crit', 'warn', 'info'];

export const ALERT_TYPES: readonly AlertType[] = [
  'criticalStock',
  'lowStock',
  'confirmationsPeak',
  'other',
];

// Texto do alerta automático de estoque crítico (< 30% do mínimo).
export function criticalStockAlertText(
  itemName: string,
  currentQuantity: number,
  minQuantity: number,
  unit: string,
): { title: string; body: string } {
  return {
    title: `Estoque crítico: ${itemName}`,
    body: `O item "${itemName}" está em ${currentQuantity}${unit}, abaixo de 30% do estoque mínimo (${minQuantity}${unit}).`,
  };
}
