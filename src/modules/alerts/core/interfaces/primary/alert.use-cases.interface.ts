import type { InjectionToken } from '@nestjs/common';
import { Alert } from '../../domain/entities/alert';
import { DemandPointReadModel } from '../../domain/read-models/demand-point/demand-point.read-model';
import { PaginationReadModel } from '../../../../../shared/domain/read-models/pagination/pagination.read-model';

// Filtro da listagem: por nível (crit/warn/info), apenas resolvidos, ou todos.
export type AlertFilter = 'crit' | 'warn' | 'info' | 'resolvidos' | 'all';

// Porta de entrada: casos de uso de alertas (HTTP, admin).
export interface IAlertUseCases {
  listAlerts(
    filter: AlertFilter,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<Alert>>;
  unresolvedCount(): Promise<number>;
  resolveAlert(id: string, resolved: boolean): Promise<void>;
  getDemand7Days(
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<DemandPointReadModel>>;
}

export const ALERT_USECASES: InjectionToken<IAlertUseCases> =
  Symbol('IAlertUseCases');
