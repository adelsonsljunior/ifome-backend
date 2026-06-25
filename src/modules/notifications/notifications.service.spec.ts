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

      expect(notificationRepository.countUnread).toHaveBeenCalledWith('user-1');
      expect(result).toBe(7);
    });
  });
  describe('markRead', () => {
    it('deve marcar como lida com sucesso', async () => {
      notificationRepository.markRead.mockResolvedValue(true);

      await service.markRead('user-1', 'notif-1');

      expect(notificationRepository.markRead).toHaveBeenCalledWith(
        'user-1',
        'notif-1',
      );
    });

    it('deve lançar NotFoundException quando a notificação não existir', async () => {
      notificationRepository.markRead.mockResolvedValue(false);

      await expect(
        service.markRead('user-1', 'id-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      notificationRepository.markRead.mockResolvedValue(false);

      await expect(
        service.markRead('user-1', 'id-inexistente'),
      ).rejects.toThrow(NotificationMessage.NOT_FOUND);
    });
  });

  describe('markAllRead', () => {
    it('deve delegar a markAllRead', async () => {
      notificationRepository.markAllRead.mockResolvedValue(undefined);

      await service.markAllRead('user-1');

      expect(notificationRepository.markAllRead).toHaveBeenCalledWith('user-1');
    });
  });
  describe('notifyUser', () => {
    it('deve criar notificação para o usuário único', async () => {
      notificationRepository.createMany.mockResolvedValue(undefined);

      await service.notifyUser('user-1', {
        icon: 'bell',
        title: 'Aviso',
        body: 'Conteúdo do aviso',
      });

      expect(notificationRepository.createMany).toHaveBeenCalledTimes(1);
      const created = notificationRepository.createMany.mock.calls[0][0];
      expect(created).toHaveLength(1);
      expect(created[0].userId).toBe('user-1');
      expect(created[0].title).toBe('Aviso');
    });
  });

  describe('notifyStudents', () => {
    it('deve buscar ids de STUDENT e criar notificações para todos', async () => {
      usersUseCases.findIdsByRole.mockResolvedValue(['user-1', 'user-2']);
      notificationRepository.createMany.mockResolvedValue(undefined);

      await service.notifyStudents({
        icon: 'utensils',
        title: 'Cardápio publicado',
        body: 'O cardápio de hoje está disponível.',
      });

      expect(usersUseCases.findIdsByRole).toHaveBeenCalledWith('STUDENT');
      const created = notificationRepository.createMany.mock.calls[0][0];
      expect(created).toHaveLength(2);
      expect(created.map((n) => n.userId)).toEqual(['user-1', 'user-2']);
    });

    it('não deve chamar createMany quando não houver estudantes', async () => {
      usersUseCases.findIdsByRole.mockResolvedValue([]);

      await service.notifyStudents({
        icon: 'utensils',
        title: 'Cardápio publicado',
        body: 'O cardápio de hoje está disponível.',
      });

      expect(notificationRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('notifyAdmins', () => {
    it('deve buscar ids de ADMIN e criar notificações para todos', async () => {
      usersUseCases.findIdsByRole.mockResolvedValue(['admin-1']);
      notificationRepository.createMany.mockResolvedValue(undefined);

      await service.notifyAdmins({
        icon: 'alert',
        title: 'Estoque crítico',
        body: 'Um item está com estoque crítico.',
      });

      expect(usersUseCases.findIdsByRole).toHaveBeenCalledWith('ADMIN');
      const created = notificationRepository.createMany.mock.calls[0][0];
      expect(created).toHaveLength(1);
      expect(created[0].userId).toBe('admin-1');
    });

    it('não deve chamar createMany quando não houver admins', async () => {
      usersUseCases.findIdsByRole.mockResolvedValue([]);

      await service.notifyAdmins({
        icon: 'alert',
        title: 'Estoque crítico',
        body: 'Um item está com estoque crítico.',
      });

      expect(notificationRepository.createMany).not.toHaveBeenCalled();
    });
  });
});
