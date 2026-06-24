import type { InjectionToken } from '@nestjs/common';
import { Alert, AlertLevel, AlertType } from '../../domain/entities/alert';
import { DemandPointReadModel } from '../../domain/read-models/demand-point/demand-point.read-model';

// Resultado paginado cru do repositório: a página de itens + o total geral.
export interface PagedResult<T> {
  rows: T[];
  total: number;
}

// Filtro de consulta de alertas traduzido do filtro da API.
export interface AlertQueryFilter {
  level?: AlertLevel;
  resolved?: boolean;
}

// Porta de saída: repositório de alertas (implementação Prisma vive em infra).
export interface IAlertRepository {
  findAlerts(
    filter: AlertQueryFilter,
    skip: number,
    take: number,
  ): Promise<PagedResult<Alert>>;
  countUnresolved(): Promise<number>;
  // Resolve/reabre o alerta; false se não existir.
  resolve(id: string, resolved: boolean): Promise<boolean>;
  // Para dedup: alerta aberto do mesmo tipo já existente para a entidade.
  findUnresolvedByTypeAndRelated(
    type: AlertType,
    relatedId: string,
  ): Promise<Alert | null>;
  create(alert: Alert): Promise<Alert>;
  // Demanda passada (DemandAnalytics) a partir de uma data, paginada.
  findDemandSince(
    from: Date,
    skip: number,
    take: number,
  ): Promise<PagedResult<DemandPointReadModel>>;
}

export const ALERT_REPOSITORY: InjectionToken<IAlertRepository> =
  Symbol('IAlertRepository');
