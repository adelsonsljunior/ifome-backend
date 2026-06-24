import type { InjectionToken } from '@nestjs/common';

// Dados necessários para gerar o alerta de estoque crítico. Payload simples para
// não acoplar o domínio de alertas à entidade de estoque.
export interface CriticalStockData {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string;
}

// Porta interna: geração automática de alertas, consumida por outros módulos
// (ex.: estoque ao detectar item abaixo de 30% do mínimo).
export interface IAlertEngine {
  raiseCriticalStockAlert(data: CriticalStockData): Promise<void>;
}

export const ALERT_ENGINE: InjectionToken<IAlertEngine> =
  Symbol('IAlertEngine');
