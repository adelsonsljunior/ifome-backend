/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmationsService } from './confirmations.service';
import {
  CONFIRMATION_REPOSITORY,
  type IConfirmationRepository,
  type MealForConfirmation,
} from './core/interfaces/secondary/confirmation.repository.interface';
import { ConfirmationReadModel } from './core/domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from './core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { ConfirmationMessage } from './core/message/confirmation.message';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';

describe('ConfirmationsService', () => {
  let service: ConfirmationsService;
  let confirmationRepositoryMock: jest.Mocked<IConfirmationRepository>;

  beforeEach(async () => {
    jest.useFakeTimers();

    const mockRepo = {
      findMealByDateAndPeriod: jest.fn(),
      countByMeal: jest.fn(),
      upsert: jest.fn(),
      findByUserAndDate: jest.fn(),
      findByUserAndMeal: jest.fn(),
      deleteById: jest.fn(),
      findRecent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmationsService,
        {
          provide: CONFIRMATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ConfirmationsService>(ConfirmationsService);
    confirmationRepositoryMock = module.get(CONFIRMATION_REPOSITORY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getToday', () => {
    it("should delegate to findByUserAndDate with today's date in UTC", async () => {
      const userId = 'user-123';
      const today = service['todayUtc']();
      const readModel = new ConfirmationReadModel(
        'conf-123',
        'meal-123',
        today,
        'lunch',
        'standard',
        new Date(),
      );

      confirmationRepositoryMock.findByUserAndDate.mockResolvedValue(readModel);

      const result = await service.getToday(userId);

      expect(result).toBe(readModel);
      expect(confirmationRepositoryMock.findByUserAndDate).toHaveBeenCalledWith(
        userId,
        today,
      );
    });

    it('should return null if no confirmation is found today', async () => {
      const userId = 'user-123';
      const today = service['todayUtc']();

      confirmationRepositoryMock.findByUserAndDate.mockResolvedValue(null);

      const result = await service.getToday(userId);

      expect(result).toBeNull();
      expect(confirmationRepositoryMock.findByUserAndDate).toHaveBeenCalledWith(
        userId,
        today,
      );
    });
  });

  describe('confirm', () => {
    const userId = 'user-123';
    const confirmData = { period: 'lunch' as const, type: 'standard' as const };
    const mealDate = new Date(Date.UTC(2026, 5, 25)); // June 25, 2026 UTC

    beforeEach(() => {
      // Mock system time to June 25, 2026 at 10:00:00 UTC
      jest.setSystemTime(new Date(Date.UTC(2026, 5, 25, 10, 0, 0)));
    });

    it('should throw BadRequestException when no meal is found today for the given period', async () => {
      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        null,
      );

      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        ConfirmationMessage.MEAL_NOT_FOUND,
      );
    });

    it('should throw BadRequestException when the meal deadline has passed (deadline boundary check)', async () => {
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '09:59', // deadline was 09:59, current time is 10:00
        capacity: 100,
      };
      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );

      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        ConfirmationMessage.DEADLINE_PASSED,
      );
    });

    it('should NOT throw when current time matches the endTime exactly (deadline boundary check)', async () => {
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '10:00', // deadline is 10:00, current time is 10:00
        capacity: 100,
      };
      const readModel = new ConfirmationReadModel(
        'conf-123',
        'meal-123',
        mealDate,
        'lunch',
        'standard',
        new Date(),
      );

      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      confirmationRepositoryMock.countByMeal.mockResolvedValue(50);
      confirmationRepositoryMock.upsert.mockResolvedValue(readModel);

      const result = await service.confirm(userId, confirmData);
      expect(result).toBe(readModel);
    });

    it('should throw ConflictException when the meal capacity is exhausted', async () => {
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '12:00', // deadline is 12:00, current time is 10:00
        capacity: 50,
      };
      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      // Capacity is 50, and 50 are already taken
      confirmationRepositoryMock.countByMeal.mockResolvedValue(50);

      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.confirm(userId, confirmData)).rejects.toThrow(
        ConfirmationMessage.CAPACITY_EXHAUSTED,
      );
      expect(confirmationRepositoryMock.countByMeal).toHaveBeenCalledWith(
        'meal-123',
        userId,
      );
    });

    it('should succeed, build confirmation and call upsert', async () => {
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '12:00',
        capacity: 50,
      };
      const readModel = new ConfirmationReadModel(
        'conf-123',
        'meal-123',
        mealDate,
        'lunch',
        'standard',
        new Date(),
      );

      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      confirmationRepositoryMock.countByMeal.mockResolvedValue(49);
      confirmationRepositoryMock.upsert.mockResolvedValue(readModel);

      const result = await service.confirm(userId, confirmData);

      expect(result).toBe(readModel);
      expect(confirmationRepositoryMock.upsert).toHaveBeenCalled();
      const passedConfirmation =
        confirmationRepositoryMock.upsert.mock.calls[0][0];
      expect(passedConfirmation.userId).toBe(userId);
      expect(passedConfirmation.mealId).toBe('meal-123');
      expect(passedConfirmation.type).toBe('standard');
    });
  });

  describe('cancelToday', () => {
    const userId = 'user-123';
    const period = 'lunch' as const;
    const mealDate = new Date(Date.UTC(2026, 5, 25));

    beforeEach(() => {
      jest.setSystemTime(new Date(Date.UTC(2026, 5, 25, 10, 0, 0)));
    });

    it('should throw NotFoundException when no meal exists today for the given period', async () => {
      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        null,
      );

      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        ConfirmationMessage.NO_CONFIRMATION_TODAY,
      );
      expect(
        confirmationRepositoryMock.findByUserAndMeal,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when there is no confirmation for the meal', async () => {
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '12:00',
        capacity: 100,
      };
      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      confirmationRepositoryMock.findByUserAndMeal.mockResolvedValue(null);

      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        ConfirmationMessage.NO_CONFIRMATION_TODAY,
      );
    });

    it('should throw ConflictException when confirmation exists but meal deadline has passed', async () => {
      const confirmation = new ConfirmationReadModel(
        'conf-123',
        'meal-123',
        mealDate,
        'lunch',
        'standard',
        new Date(),
      );
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '09:59', // deadline is 09:59, current time is 10:00
        capacity: 100,
      };

      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      confirmationRepositoryMock.findByUserAndMeal.mockResolvedValue(
        confirmation,
      );

      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.cancelToday(userId, period)).rejects.toThrow(
        ConfirmationMessage.DEADLINE_PASSED,
      );
      expect(confirmationRepositoryMock.deleteById).not.toHaveBeenCalled();
    });

    it('should cancel the confirmation of the given period when deadline has not passed', async () => {
      const confirmation = new ConfirmationReadModel(
        'conf-123',
        'meal-123',
        mealDate,
        'lunch',
        'standard',
        new Date(),
      );
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '12:00', // deadline is 12:00, current time is 10:00
        capacity: 100,
      };

      confirmationRepositoryMock.findMealByDateAndPeriod.mockResolvedValue(
        meal,
      );
      confirmationRepositoryMock.findByUserAndMeal.mockResolvedValue(
        confirmation,
      );
      confirmationRepositoryMock.deleteById.mockResolvedValue(undefined);

      await service.cancelToday(userId, period);

      expect(
        confirmationRepositoryMock.findMealByDateAndPeriod,
      ).toHaveBeenCalledWith(service['todayUtc'](), period);
      expect(confirmationRepositoryMock.findByUserAndMeal).toHaveBeenCalledWith(
        userId,
        'meal-123',
      );
      expect(confirmationRepositoryMock.deleteById).toHaveBeenCalledWith(
        'conf-123',
      );
    });
  });

  describe('getRecent', () => {
    it('should correctly calculate skip and pass pagination & order to repo', async () => {
      const page = 3;
      const pageSize = 10;
      const order = 'newest' as const;

      const rows: RecentConfirmationReadModel[] = [
        new RecentConfirmationReadModel(
          'conf-1',
          'user-1',
          'User 1',
          '20231',
          new Date(),
          'lunch',
          'standard',
          new Date(),
        ),
      ];
      const total = 25;

      confirmationRepositoryMock.findRecent.mockResolvedValue({ rows, total });

      const result = await service.getRecent(page, pageSize, order);

      expect(confirmationRepositoryMock.findRecent).toHaveBeenCalledWith(
        20, // skip = (3 - 1) * 10 = 20
        10,
        'newest',
      );
      expect(result).toEqual(
        PaginationReadModel.create(rows, page, pageSize, total),
      );
    });
  });

  describe('Private methods (boundary checks)', () => {
    describe('todayUtc', () => {
      it('should return a date representing midnight UTC for today', () => {
        const mockDate = new Date(2026, 5, 25, 15, 30, 0); // local date
        jest.setSystemTime(mockDate);

        const result = service['todayUtc']();
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
        expect(result.getUTCFullYear()).toBe(mockDate.getFullYear());
        expect(result.getUTCMonth()).toBe(mockDate.getMonth());
        expect(result.getUTCDate()).toBe(mockDate.getDate());
      });
    });

    describe('deadlinePassed', () => {
      const mealDate = new Date(Date.UTC(2026, 5, 25)); // 2026-06-25 UTC
      const meal: MealForConfirmation = {
        id: 'meal-123',
        date: mealDate,
        period: 'lunch',
        endTime: '13:00', // deadline is 13:00 UTC
        capacity: 10,
      };

      it('should return true if current time is after the deadline', () => {
        jest.setSystemTime(new Date(Date.UTC(2026, 5, 25, 13, 0, 1))); // 13:00:01 UTC
        const result = service['deadlinePassed'](meal);
        expect(result).toBe(true);
      });

      it('should return false if current time is exactly at the deadline', () => {
        jest.setSystemTime(new Date(Date.UTC(2026, 5, 25, 13, 0, 0))); // 13:00:00 UTC
        const result = service['deadlinePassed'](meal);
        expect(result).toBe(false);
      });

      it('should return false if current time is before the deadline', () => {
        jest.setSystemTime(new Date(Date.UTC(2026, 5, 25, 12, 59, 59))); // 12:59:59 UTC
        const result = service['deadlinePassed'](meal);
        expect(result).toBe(false);
      });
    });
  });
});
