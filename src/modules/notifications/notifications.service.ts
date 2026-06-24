import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationBuilder,
} from './core/domain/entities/notification';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import { INotificationUseCases } from './core/interfaces/primary/notification.use-cases.interface';
import {
  INotificationEngine,
  NotificationPayload,
} from './core/interfaces/primary/notification-engine.interface';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from './core/interfaces/secondary/notification.repository.interface';
import { NotificationMessage } from './core/message/notification.message';
import {
  USERS_USECASES,
  type IUsersUseCases,
} from '../users/core/interfaces/primary/user.use-cases.interface';

@Injectable()
export class NotificationsService
  implements INotificationUseCases, INotificationEngine
{
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(USERS_USECASES)
    private readonly usersUseCases: IUsersUseCases,
  ) {}

  // ----- Casos de uso (HTTP) -----

  async listForUser(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<Notification>> {
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.notificationRepository.findByUser(
      userId,
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markRead(userId: string, id: string): Promise<void> {
    const updated = await this.notificationRepository.markRead(userId, id);
    if (!updated) {
      this.logger.warn(`Notification ${id} not found for user ${userId}`);
      throw new NotFoundException(NotificationMessage.NOT_FOUND);
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllRead(userId);
  }

  // ----- Engine (geração automática) -----

  async notifyUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    await this.createForUsers([userId], payload);
  }

  async notifyStudents(payload: NotificationPayload): Promise<void> {
    const ids = await this.usersUseCases.findIdsByRole('STUDENT');
    await this.createForUsers(ids, payload);
  }

  async notifyAdmins(payload: NotificationPayload): Promise<void> {
    const ids = await this.usersUseCases.findIdsByRole('ADMIN');
    await this.createForUsers(ids, payload);
  }

  private async createForUsers(
    userIds: string[],
    payload: NotificationPayload,
  ): Promise<void> {
    if (userIds.length === 0) return;
    const notifications = userIds.map((userId) =>
      new NotificationBuilder()
        .withUserId(userId)
        .withIcon(payload.icon)
        .withTitle(payload.title)
        .withBody(payload.body)
        .build(),
    );
    await this.notificationRepository.createMany(notifications);
  }
}
