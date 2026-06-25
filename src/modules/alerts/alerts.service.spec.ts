/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import {
  ALERT_REPOSITORY,
  type IAlertRepository,
} from './core/interfaces/secondary/alert.repository.interface';
import {
  NOTIFICATION_ENGINE,
  type INotificationEngine,
} from '../notifications/core/interfaces/primary/notification-engine.interface';
import { Alert, AlertBuilder } from './core/domain/entities/alert';
import { AlertFilter } from './core/interfaces/primary/alert.use-cases.interface';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import { NotFoundException } from '@nestjs/common';
import {
  AlertMessage,
  criticalStockAlertText,
} from './core/message/alert.message';
import { DemandPointReadModel } from './core/domain/read-models/demand-point/demand-point.read-model';

describe('AlertsService', () => {
  let service: AlertsService;
  let alertRepositoryMock: jest.Mocked<IAlertRepository>;
  let notificationEngineMock: jest.Mocked<INotificationEngine>;

  beforeEach(async () => {
    jest.useFakeTimers();

    const mockRepo = {
      findAlerts: jest.fn(),
      countUnresolved: jest.fn(),
      resolve: jest.fn(),
      findUnresolvedByTypeAndRelated: jest.fn(),
      create: jest.fn(),
      findDemandSince: jest.fn(),
    };

    const mockNotif = {
      notifyUser: jest.fn(),
      notifyStudents: jest.fn(),
      notifyAdmins: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: ALERT_REPOSITORY,
          useValue: mockRepo,
        },
        {
          provide: NOTIFICATION_ENGINE,
          useValue: mockNotif,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    alertRepositoryMock = module.get(ALERT_REPOSITORY);
    notificationEngineMock = module.get(NOTIFICATION_ENGINE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('listAlerts', () => {
    const mockAlert = new AlertBuilder()
      .withId('alert-1')
      .withLevel('crit')
      .withType('criticalStock')
      .withTitle('Title')
      .withBody('Body')
      .build();

    const pagedResult = {
      rows: [mockAlert],
      total: 1,
    };

    beforeEach(() => {
      alertRepositoryMock.findAlerts.mockResolvedValue(pagedResult);
    });

    it('should translate filter "resolvidos" to {resolved: true} and call repo', async () => {
      const result = await service.listAlerts('resolvidos', 2, 5);

      expect(alertRepositoryMock.findAlerts).toHaveBeenCalledWith(
        { resolved: true },
        5, // skip = (2-1)*5 = 5
        5,
      );
      expect(result).toEqual(PaginationReadModel.create([mockAlert], 2, 5, 1));
    });

    it('should translate filter "all" to {} and call repo', async () => {
      const result = await service.listAlerts('all', 1, 10);

      expect(alertRepositoryMock.findAlerts).toHaveBeenCalledWith(
        {},
        0, // skip = (1-1)*10 = 0
        10,
      );
      expect(result).toEqual(PaginationReadModel.create([mockAlert], 1, 10, 1));
    });

    it('should translate other filters directly to {level: filter} and call repo', async () => {
      const filter: AlertFilter = 'warn';
      const result = await service.listAlerts(filter, 3, 2);

      expect(alertRepositoryMock.findAlerts).toHaveBeenCalledWith(
        { level: 'warn' },
        4, // skip = (3-1)*2 = 4
        2,
      );
      expect(result).toEqual(PaginationReadModel.create([mockAlert], 3, 2, 1));
    });
  });

  describe('unresolvedCount', () => {
    it('should delegate countUnresolved to repository', async () => {
      alertRepositoryMock.countUnresolved.mockResolvedValue(42);

      const result = await service.unresolvedCount();

      expect(result).toBe(42);
      expect(alertRepositoryMock.countUnresolved).toHaveBeenCalled();
    });
  });

  describe('resolveAlert', () => {
    it('should succeed when repository successfully resolves the alert', async () => {
      alertRepositoryMock.resolve.mockResolvedValue(true);

      await expect(
        service.resolveAlert('alert-1', true),
      ).resolves.not.toThrow();

      expect(alertRepositoryMock.resolve).toHaveBeenCalledWith('alert-1', true);
    });

    it('should throw NotFoundException when repository resolve returns false', async () => {
      alertRepositoryMock.resolve.mockResolvedValue(false);

      await expect(service.resolveAlert('alert-1', true)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.resolveAlert('alert-1', true)).rejects.toThrow(
        AlertMessage.NOT_FOUND,
      );
      expect(alertRepositoryMock.resolve).toHaveBeenCalledWith('alert-1', true);
    });
  });

  describe('getDemand7Days', () => {
    it('should call findDemandSince with 7 days ago window (from today midnight UTC) and paginate correctly', async () => {
      // Set system time
      const mockDate = new Date(Date.UTC(2026, 5, 25, 12, 0, 0));
      jest.setSystemTime(mockDate);

      // 7 days ago window from today 2026-06-25 local will be computed
      const expectedFrom = service['daysAgoUtc'](6);

      const mockPoint = new DemandPointReadModel(new Date(), 'lunch', 100);
      const rows = [mockPoint];
      const total = 50;

      alertRepositoryMock.findDemandSince.mockResolvedValue({ rows, total });

      const result = await service.getDemand7Days(2, 10);

      expect(alertRepositoryMock.findDemandSince).toHaveBeenCalledWith(
        expectedFrom,
        10, // skip = (2-1)*10 = 10
        10,
      );
      expect(result).toEqual(PaginationReadModel.create(rows, 2, 10, total));
    });
  });

  describe('raiseCriticalStockAlert', () => {
    const data = {
      itemId: 'item-123',
      itemName: 'Arroz',
      currentQuantity: 5,
      minQuantity: 20,
      unit: 'kg',
    };

    it('should dedup and not create alert or notify if unresolved alert already exists', async () => {
      const existingAlert = new AlertBuilder()
        .withId('alert-1')
        .withLevel('crit')
        .withType('criticalStock')
        .withTitle('Existing')
        .withBody('Existing body')
        .build();

      alertRepositoryMock.findUnresolvedByTypeAndRelated.mockResolvedValue(
        existingAlert,
      );

      await service.raiseCriticalStockAlert(data);

      expect(
        alertRepositoryMock.findUnresolvedByTypeAndRelated,
      ).toHaveBeenCalledWith('criticalStock', data.itemId);
      expect(alertRepositoryMock.create).not.toHaveBeenCalled();
      expect(notificationEngineMock.notifyAdmins).not.toHaveBeenCalled();
    });

    it('should create critical stock alert and notify admins if no unresolved alert exists', async () => {
      alertRepositoryMock.findUnresolvedByTypeAndRelated.mockResolvedValue(
        null,
      );
      alertRepositoryMock.create.mockImplementation((alert) =>
        Promise.resolve(alert),
      );
      notificationEngineMock.notifyAdmins.mockResolvedValue(undefined);

      const text = criticalStockAlertText(
        data.itemName,
        data.currentQuantity,
        data.minQuantity,
        data.unit,
      );

      await service.raiseCriticalStockAlert(data);

      expect(
        alertRepositoryMock.findUnresolvedByTypeAndRelated,
      ).toHaveBeenCalledWith('criticalStock', data.itemId);

      // Verify repository create was called with correct Alert properties
      expect(alertRepositoryMock.create).toHaveBeenCalled();
      const createdAlert: Alert = alertRepositoryMock.create.mock.calls[0][0];
      expect(createdAlert.level).toBe('crit');
      expect(createdAlert.type).toBe('criticalStock');
      expect(createdAlert.title).toBe(text.title);
      expect(createdAlert.body).toBe(text.body);
      expect(createdAlert.relatedId).toBe(data.itemId);

      // Verify notification engine notifyAdmins was called
      expect(notificationEngineMock.notifyAdmins).toHaveBeenCalledWith({
        icon: 'alert',
        title: text.title,
        body: text.body,
      });
    });
  });

  describe('Private methods (boundary checks)', () => {
    describe('daysAgoUtc', () => {
      it('should compute midnight UTC date for N days ago correctly', () => {
        const mockNow = new Date(2026, 5, 25, 14, 0, 0); // June 25, 2026 local
        jest.setSystemTime(mockNow);

        const result = service['daysAgoUtc'](6);

        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
        // Expect result's UTC date to match local now day minus 6 days
        const localNowMidnightMinus6 = new Date(
          Date.UTC(
            mockNow.getFullYear(),
            mockNow.getMonth(),
            mockNow.getDate() - 6,
          ),
        );
        expect(result.getUTCDate()).toBe(localNowMidnightMinus6.getUTCDate());
        expect(result.getUTCMonth()).toBe(localNowMidnightMinus6.getUTCMonth());
        expect(result.getUTCFullYear()).toBe(
          localNowMidnightMinus6.getUTCFullYear(),
        );
      });
    });

    describe('toQueryFilter', () => {
      it('should map api filter resolvidos correctly', () => {
        expect(service['toQueryFilter']('resolvidos')).toEqual({
          resolved: true,
        });
      });

      it('should map api filter all correctly', () => {
        expect(service['toQueryFilter']('all')).toEqual({});
      });

      it('should map level filters correctly', () => {
        expect(service['toQueryFilter']('crit')).toEqual({ level: 'crit' });
        expect(service['toQueryFilter']('warn')).toEqual({ level: 'warn' });
        expect(service['toQueryFilter']('info')).toEqual({ level: 'info' });
      });
    });
  });
});
