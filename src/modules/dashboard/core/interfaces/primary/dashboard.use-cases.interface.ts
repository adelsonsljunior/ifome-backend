import type { InjectionToken } from '@nestjs/common';
import { DashboardReadModel } from '../../domain/read-models/dashboard/dashboard.read-model';

// Porta de entrada: caso de uso do painel administrativo (implementado pelo DashboardService).
export interface IDashboardUseCases {
  getDashboard(): Promise<DashboardReadModel>;
}

export const DASHBOARD_USECASES: InjectionToken<IDashboardUseCases> =
  Symbol('IDashboardUseCases');
