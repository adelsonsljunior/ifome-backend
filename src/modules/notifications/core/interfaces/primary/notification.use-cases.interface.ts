import type { InjectionToken } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification';
import { PaginationReadModel } from '../../../../../shared/domain/read-models/pagination/pagination.read-model';

// Porta de entrada: casos de uso de notificações do próprio usuário (HTTP).
export interface INotificationUseCases {
  listForUser(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<Notification>>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
}

export const NOTIFICATION_USECASES: InjectionToken<INotificationUseCases> =
  Symbol('INotificationUseCases');
