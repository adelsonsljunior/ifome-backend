// Nível do alerta no domínio. Espelha o enum AlertLevel do banco com vocabulário
// curto da API ('crit'/'warn'); a conversão acontece na borda (mappers).
export type AlertLevel = 'crit' | 'warn' | 'info';

// Tipo/origem do alerta. Espelha o enum AlertType do banco (mesmos valores).
export type AlertType =
  | 'criticalStock'
  | 'lowStock'
  | 'confirmationsPeak'
  | 'other';

// Propriedades de um alerta da gestão.
// `relatedId` referencia a entidade de origem (ex.: item de estoque) sem FK.
// `resolvedAt` nulo = alerta aberto. `id`, `createdAt` só existem após persistir.
export interface AlertProps {
  id?: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  body: string;
  relatedId?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
}
