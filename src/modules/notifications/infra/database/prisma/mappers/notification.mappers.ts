import {
  Notification,
  NotificationBuilder,
  NotificationIcon,
} from '../../../../core/domain/entities/notification';

// Linha do Prisma de uma notificação.
export interface NotificationPrismaRow {
  id: string;
  userId: string;
  icon: NotificationIcon;
  title: string;
  body: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class NotificationPrismaMapper {
  static toDomain(row: NotificationPrismaRow): Notification {
    return new NotificationBuilder()
      .withId(row.id)
      .withUserId(row.userId)
      .withIcon(row.icon)
      .withTitle(row.title)
      .withBody(row.body)
      .withRead(row.read)
      .withReadAt(row.readAt)
      .withCreatedAt(row.createdAt)
      .build();
  }
}
