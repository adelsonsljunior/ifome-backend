/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  NOTIFICATION_REPOSITORY,
  INotificationRepository,
} from './core/interfaces/secondary/notification.repository.interface';
import {
  USERS_USECASES,
  IUsersUseCases,
} from '../users/core/interfaces/primary/user.use-cases.interface';
import { NotificationBuilder } from './core/domain/entities/notification';
import { NotificationMessage } from './core/message/notification.message';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let usersUseCases: jest.Mocked<IUsersUseCases>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<INotificationRepository> = {
      findByUser: jest.fn(),
      countUnread: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      createMany: jest.fn(),
    };

    const mockUsersUseCases: jest.Mocked<IUsersUseCases> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getMealHistory: jest.fn(),
      findIdsByRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NOTIFICATION_REPOSITORY, useValue: mockRepository },
        { provide: USERS_USECASES, useValue: mockUsersUseCases },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(NOTIFICATION_REPOSITORY);
    usersUseCases = module.get(USERS_USECASES);
  });

  function buildNotification(overrides?: { userId?: string }) {
    return new NotificationBuilder()
      .withId('notif-1')
      .withUserId(overrides?.userId ?? 'user-1')
      .withIcon('bell')
      .withTitle('Cardápio atualizado')
      .withBody('O cardápio de hoje foi publicado.')
      .build();
  }

  describe('listForUser', () => {
    it('deve calcular skip corretamente e montar a paginação', async () => {
      const notification = buildNotification();
      notificationRepository.findByUser.mockResolvedValue({
        rows: [notification],
        total: 12,
      });

      const result = await service.listForUser('user-1', 2, 5);

      expect(notificationRepository.findByUser).toHaveBeenCalledWith(
        'user-1',
        5,
        5,
      );
      expect(result.data).toEqual([notification]);
      expect(result.total).toBe(12);
      expect(result.totalPages).toBe(3); 
    });
  });

  describe('unreadCount', () => {
    it('deve delegar a countUnread', async () => {
      notificationRepository.countUnread.mockResolvedValue(7);

      const result = await service.unreadCount('user-1');

      expect(notificationRepository.countUnread).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toBe(7);
    });
  });
});