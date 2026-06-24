import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Notification } from '../../../core/domain/entities/notification';
import {
  INotificationRepository,
  PagedResult,
} from '../../../core/interfaces/secondary/notification.repository.interface';
import { NotificationPrismaMapper } from '../prisma/mappers/notification.mappers';

// Implementação Prisma do repositório de notificações.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PagedResult<Notification>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      rows: rows.map((row) => NotificationPrismaMapper.toDomain(row)),
      total,
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(userId: string, id: string): Promise<boolean> {
    // updateMany com escopo no userId garante posse: count 0 = não é do usuário.
    const { count } = await this.prisma.notification.updateMany({
      where: { id, userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    if (count > 0) return true;
    // Já estava lida? Então existe e pertence ao usuário — considera sucesso.
    const exists = await this.prisma.notification.count({
      where: { id, userId },
    });
    return exists > 0;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async createMany(notifications: Notification[]): Promise<void> {
    await this.prisma.notification.createMany({
      // não envia `id`: o banco gera via uuidv7().
      data: notifications.map((n) => ({
        userId: n.userId,
        icon: n.icon,
        title: n.title,
        body: n.body,
      })),
    });
  }
}
