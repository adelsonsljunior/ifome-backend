/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import {
  MENU_USECASES,
  IMenuUseCases,
} from '../menu/core/interfaces/primary/menu.use-cases.interface';
import {
  ALERT_USECASES,
  IAlertUseCases,
} from '../alerts/core/interfaces/primary/alert.use-cases.interface';
import {
  STOCK_USECASES,
  IStockUseCases,
} from '../stock/core/interfaces/primary/stock.use-cases.interface';
import {
  CONFIRMATION_USECASES,
  IConfirmationUseCases,
} from '../confirmations/core/interfaces/primary/confirmation.use-cases.interface';
import { MenuDayReadModel, MealView } from '../menu/core/domain/read-models/menu-day/menu-day.read-model';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import { StockItemBuilder } from '../stock/core/domain/entities/stock-item';

describe('DashboardService', () => {
  let service: DashboardService;
  let menuUseCases: jest.Mocked<IMenuUseCases>;
  let alertUseCases: jest.Mocked<IAlertUseCases>;
  let stockUseCases: jest.Mocked<IStockUseCases>;
  let confirmationUseCases: jest.Mocked<IConfirmationUseCases>;

  beforeEach(async () => {
    const mockMenuUseCases: jest.Mocked<IMenuUseCases> = {
      getToday: jest.fn(),
      getWeek: jest.fn(),
      getDishById: jest.fn(),
      createDish: jest.fn(),
      updateDish: jest.fn(),
      deleteDish: jest.fn(),
      createMeal: jest.fn(),
      updateMeal: jest.fn(),
    };

    const mockAlertUseCases: jest.Mocked<IAlertUseCases> = {
      listAlerts: jest.fn(),
      unresolvedCount: jest.fn(),
      resolveAlert: jest.fn(),
      getDemand7Days: jest.fn(),
    };

    const mockStockUseCases: jest.Mocked<IStockUseCases> = {
      listItems: jest.fn(),
      getItem: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      registerMovement: jest.fn(),
      listMovements: jest.fn(),
    };

    const mockConfirmationUseCases: jest.Mocked<IConfirmationUseCases> = {
      getToday: jest.fn(),
      confirm: jest.fn(),
      cancelToday: jest.fn(),
      getRecent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: MENU_USECASES, useValue: mockMenuUseCases },
        { provide: ALERT_USECASES, useValue: mockAlertUseCases },
        { provide: STOCK_USECASES, useValue: mockStockUseCases },
        { provide: CONFIRMATION_USECASES, useValue: mockConfirmationUseCases },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    menuUseCases = module.get(MENU_USECASES);
    alertUseCases = module.get(ALERT_USECASES);
    stockUseCases = module.get(STOCK_USECASES);
    confirmationUseCases = module.get(CONFIRMATION_USECASES);
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function buildMenuDay(meals: MealView[] = []): MenuDayReadModel {
    return new MenuDayReadModel(new Date('2026-07-01T00:00:00.000Z'), meals);
  }

  function buildMealView(
    capacity: number,
    confirmedCount: number,
  ): MealView {
    return new MealView(
      'meal-1',
      'lunch',
      '11:00',
      '13:00',
      capacity,
      confirmedCount,
      [],
    );
  }

  function buildStockItem(id: string, status: 'crit' | 'low' | 'ok') {
    return new StockItemBuilder()
      .withId(id)
      .withName('Item ' + id)
      .withCategory('Grãos')
      .withCurrentQuantity(status === 'crit' ? 2 : 15)
      .withMinQuantity(10)
      .withMaxQuantity(100)
      .withUnit('kg')
      .withStatus(status)
      .build();
  }

  function emptyPage<T>(): PaginationReadModel<T> {
    return PaginationReadModel.create([], 1, 10, 0);
  }

  function pageOf<T>(items: T[]): PaginationReadModel<T> {
    return PaginationReadModel.create(items, 1, 1000, items.length);
  }

  function setupDefaultMocks(overrides: {
    menuToday?: MenuDayReadModel;
    critItems?: ReturnType<typeof buildStockItem>[];
    lowItems?: ReturnType<typeof buildStockItem>[];
  } = {}) {
    menuUseCases.getToday.mockResolvedValue(
      overrides.menuToday ?? buildMenuDay(),
    );
    alertUseCases.listAlerts.mockResolvedValue(emptyPage());
    stockUseCases.listItems
      .mockResolvedValueOnce(pageOf(overrides.critItems ?? []))  // 'crit'
      .mockResolvedValueOnce(pageOf(overrides.lowItems ?? []));  // 'low'
    alertUseCases.getDemand7Days.mockResolvedValue(emptyPage());
    confirmationUseCases.getRecent.mockResolvedValue(emptyPage());
  }

  // ─── getDashboard ────────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('deve agregar as 6 fontes em paralelo (Promise.all)', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(menuUseCases.getToday).toHaveBeenCalledTimes(1);
      expect(alertUseCases.listAlerts).toHaveBeenCalledTimes(1);
      expect(stockUseCases.listItems).toHaveBeenCalledTimes(2);
      expect(alertUseCases.getDemand7Days).toHaveBeenCalledTimes(1);
      expect(confirmationUseCases.getRecent).toHaveBeenCalledTimes(1);
    });

    it('deve chamar listAlerts com filtro "all", page 1 e limit 6', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(alertUseCases.listAlerts).toHaveBeenCalledWith('all', 1, 6);
    });

    it('deve chamar listItems com "crit" e limit 1000', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(stockUseCases.listItems).toHaveBeenCalledWith('crit', 1, 1000);
    });

    it('deve chamar listItems com "low" e limit 1000', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(stockUseCases.listItems).toHaveBeenCalledWith('low', 1, 1000);
    });

    it('deve chamar getDemand7Days com page 1 e limit 100', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(alertUseCases.getDemand7Days).toHaveBeenCalledWith(1, 100);
    });

    it('deve chamar getRecent com page 1, limit 5 e order "newest"', async () => {
      setupDefaultMocks();

      await service.getDashboard();

      expect(confirmationUseCases.getRecent).toHaveBeenCalledWith(1, 5, 'newest');
    });

    it('deve ordenar itens em falta com críticos antes dos baixos', async () => {
      const critItem = buildStockItem('crit-1', 'crit');
      const lowItem = buildStockItem('low-1', 'low');
      setupDefaultMocks({ critItems: [critItem], lowItems: [lowItem] });

      const result = await service.getDashboard();

      expect(result.stock).toHaveLength(2);
      expect(result.stock[0]).toBe(critItem);
      expect(result.stock[1]).toBe(lowItem);
    });

    it('deve retornar apenas críticos quando não há itens baixos', async () => {
      const critItem = buildStockItem('crit-1', 'crit');
      setupDefaultMocks({ critItems: [critItem], lowItems: [] });

      const result = await service.getDashboard();

      expect(result.stock).toEqual([critItem]);
    });

    it('deve retornar apenas baixos quando não há itens críticos', async () => {
      const lowItem = buildStockItem('low-1', 'low');
      setupDefaultMocks({ critItems: [], lowItems: [lowItem] });

      const result = await service.getDashboard();

      expect(result.stock).toEqual([lowItem]);
    });

    it('deve retornar lista de estoque vazia quando não há itens em falta', async () => {
      setupDefaultMocks();

      const result = await service.getDashboard();

      expect(result.stock).toEqual([]);
    });

    it('deve calcular stats corretamente com múltiplas refeições', async () => {
      const meals = [
        buildMealView(100, 80),
        buildMealView(200, 50),
      ];
      setupDefaultMocks({ menuToday: buildMenuDay(meals) });

      const result = await service.getDashboard();

      expect(result.stats.mealsCount).toBe(2);
      expect(result.stats.totalCapacity).toBe(300);
      expect(result.stats.totalConfirmed).toBe(130);
      // Math.round((130 / 300) * 100) = Math.round(43.33) = 43
      expect(result.stats.occupancyPercent).toBe(43);
    });

    it('deve retornar stats zeradas quando não há refeições hoje', async () => {
      setupDefaultMocks({ menuToday: buildMenuDay([]) });

      const result = await service.getDashboard();

      expect(result.stats.mealsCount).toBe(0);
      expect(result.stats.totalCapacity).toBe(0);
      expect(result.stats.totalConfirmed).toBe(0);
      expect(result.stats.occupancyPercent).toBe(0);
    });

    it('deve calcular occupancyPercent como 0 quando totalCapacity é 0', async () => {
      const meals = [buildMealView(0, 0)];
      setupDefaultMocks({ menuToday: buildMenuDay(meals) });

      const result = await service.getDashboard();

      // capacity=0 → DashboardStats.occupancyPercent guard evita divisão por zero
      expect(result.stats.occupancyPercent).toBe(0);
    });

    it('deve retornar o menuToday recebido de menu.getToday', async () => {
      const menuToday = buildMenuDay([buildMealView(100, 40)]);
      setupDefaultMocks({ menuToday });

      const result = await service.getDashboard();

      expect(result.menuToday).toBe(menuToday);
    });

    it('deve retornar múltiplos críticos e múltiplos baixos mantendo a ordem crit→low', async () => {
      const crit1 = buildStockItem('crit-1', 'crit');
      const crit2 = buildStockItem('crit-2', 'crit');
      const low1 = buildStockItem('low-1', 'low');
      const low2 = buildStockItem('low-2', 'low');
      setupDefaultMocks({
        critItems: [crit1, crit2],
        lowItems: [low1, low2],
      });

      const result = await service.getDashboard();

      expect(result.stock).toEqual([crit1, crit2, low1, low2]);
    });
  });
});
