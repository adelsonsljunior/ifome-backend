import type { InjectionToken } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification';

// Resultado paginado cru do repositório: a página de itens + o total geral.
export interface PagedResult<T> {
  rows: T[];
  total: number;
}

// Porta de saída: repositório de notificações (implementação Prisma vive em infra).
export interface INotificationRepository {
  findByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PagedResult<Notification>>;
  countUnread(userId: string): Promise<number>;
  // Marca uma notificação do usuário como lida; false se não existir/não for dele.
  markRead(userId: string, id: string): Promise<boolean>;
  markAllRead(userId: string): Promise<void>;
  // Insere várias notificações (geração automática).
  createMany(notifications: Notification[]): Promise<void>;
}

export const NOTIFICATION_REPOSITORY: InjectionToken<INotificationRepository> =
  Symbol('INotificationRepository');
