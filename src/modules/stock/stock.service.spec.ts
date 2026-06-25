import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service';
import {
  STOCK_REPOSITORY,
  IStockRepository,
} from './core/interfaces/secondary/stock.repository.interface';
import {
  ALERT_ENGINE,
  IAlertEngine,
} from '../alerts/core/interfaces/primary/alert-engine.interface';
import { StockItemBuilder } from './core/domain/entities/stock-item';
import { StockMovementBuilder } from './core/domain/entities/stock-movement';
import { StockMessage } from './core/message/stock.message';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: jest.Mocked<IStockRepository>;
  let alertEngine: jest.Mocked<IAlertEngine>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IStockRepository> = {
      findItems: jest.fn(),
      findItemById: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      registerMovement: jest.fn(),
      findMovements: jest.fn(),
    };

    const mockAlertEngine: jest.Mocked<IAlertEngine> = {
      raiseCriticalStockAlert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: STOCK_REPOSITORY, useValue: mockRepository },
        { provide: ALERT_ENGINE, useValue: mockAlertEngine },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    stockRepository = module.get(STOCK_REPOSITORY);
    alertEngine = module.get(ALERT_ENGINE);
  });

  function buildItem(overrides?: {
    id?: string;
    currentQuantity?: number;
    minQuantity?: number;
    maxQuantity?: number;
    status?: 'ok' | 'low' | 'crit';
  }) {
    return new StockItemBuilder()
      .withId(overrides?.id ?? 'item-1')
      .withName('Arroz')
      .withCategory('Grãos')
      .withCurrentQuantity(overrides?.currentQuantity ?? 50)
      .withMinQuantity(overrides?.minQuantity ?? 10)
      .withMaxQuantity(overrides?.maxQuantity ?? 100)
      .withUnit('kg')
      .withStatus(overrides?.status ?? 'ok')
      .build();
  }

  describe('listItems', () => {
    it('deve usar status undefined quando o filtro for "all"', async () => {
      stockRepository.findItems.mockResolvedValue({ rows: [], total: 0 });

      await service.listItems('all', 1, 10);

      expect(stockRepository.findItems).toHaveBeenCalledWith(
        undefined,
        0,
        10,
      );
    });

    it('deve repassar o status quando o filtro não for "all"', async () => {
      stockRepository.findItems.mockResolvedValue({ rows: [], total: 0 });

      await service.listItems('crit', 1, 10);

      expect(stockRepository.findItems).toHaveBeenCalledWith('crit', 0, 10);
    });

    it('deve calcular skip corretamente e montar a paginação', async () => {
      const items = [buildItem(), buildItem({ id: 'item-2' })];
      stockRepository.findItems.mockResolvedValue({ rows: items, total: 15 });

      const result = await service.listItems('all', 2, 5);

      expect(stockRepository.findItems).toHaveBeenCalledWith(undefined, 5, 5);
      expect(result.data).toBe(items);
      expect(result.total).toBe(15);
      expect(result.totalPages).toBe(3); // ceil(15/5) = 3
    });
  });
});