import type { InjectionToken } from '@nestjs/common';
import {
  ConfirmationType,
  MealPeriod,
} from '../../domain/entities/confirmation';
import { ConfirmationReadModel } from '../../domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from '../../domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { PaginationReadModel } from '../../../../../shared/domain/read-models/pagination/pagination.read-model';

// Dados da confirmação solicitada pelo aluno (refeição de hoje no período informado).
export interface ConfirmData {
  period: MealPeriod;
  type: ConfirmationType;
}

// Ordenação aceita para confirmações recentes (painel admin):
// mais recentes (newest) ou mais antigas (oldest) primeiro.
export type RecentConfirmationsOrder = 'newest' | 'oldest';

// Porta de entrada: casos de uso de confirmações (implementados pelo ConfirmationsService).
export interface IConfirmationUseCases {
  getToday(userId: string): Promise<ConfirmationReadModel | null>;
  confirm(userId: string, data: ConfirmData): Promise<ConfirmationReadModel>;
  cancelToday(userId: string): Promise<void>;
  getRecent(
    page: number,
    pageSize: number,
    order: RecentConfirmationsOrder,
  ): Promise<PaginationReadModel<RecentConfirmationReadModel>>;
}

export const CONFIRMATION_USECASES: InjectionToken<IConfirmationUseCases> =
  Symbol('IConfirmationUseCases');
