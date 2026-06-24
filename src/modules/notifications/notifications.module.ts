import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATION_USECASES } from './core/interfaces/primary/notification.use-cases.interface';
import { NOTIFICATION_ENGINE } from './core/interfaces/primary/notification-engine.interface';
import { NOTIFICATION_REPOSITORY } from './core/interfaces/secondary/notification.repository.interface';
import { NotificationRepository } from './infra/database/repository/notification.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    { provide: NOTIFICATION_USECASES, useExisting: NotificationsService },
    { provide: NOTIFICATION_ENGINE, useExisting: NotificationsService },
    NotificationRepository,
    { provide: NOTIFICATION_REPOSITORY, useExisting: NotificationRepository },
  ],
  exports: [NOTIFICATION_USECASES, NOTIFICATION_ENGINE],
})
export class NotificationsModule {}
