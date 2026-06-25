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
      expect(result.totalPages).toBe(3); 
    });
  });
  describe('getItem', () => {
    it('deve retornar o item quando encontrado', async () => {
      const item = buildItem();
      stockRepository.findItemById.mockResolvedValue(item);

      const result = await service.getItem('item-1');

      expect(stockRepository.findItemById).toHaveBeenCalledWith('item-1');
      expect(result).toBe(item);
    });

    it('deve lançar NotFoundException quando o item não existir', async () => {
      stockRepository.findItemById.mockResolvedValue(null);

      await expect(service.getItem('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createItem', () => {
    const validData = {
      name: 'Feijão',
      category: 'Grãos',
      currentQuantity: 50,
      minQuantity: 10,
      maxQuantity: 100,
      unit: 'kg',
    };

    it('deve criar o item quando o range é válido (min < atual < max)', async () => {
      const createdItem = buildItem();
      stockRepository.createItem.mockResolvedValue(createdItem);

      const result = await service.createItem(validData);

      expect(stockRepository.createItem).toHaveBeenCalledWith(validData);
      expect(result).toBe(createdItem);
    });

    it('deve lançar BadRequestException quando a quantidade atual for igual ao mínimo', async () => {
      const invalidData = { ...validData, currentQuantity: 10, minQuantity: 10 };

      await expect(service.createItem(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando a quantidade atual for igual ao máximo', async () => {
      const invalidData = { ...validData, currentQuantity: 100, maxQuantity: 100 };

      await expect(service.createItem(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException com a mensagem correta de range inválido', async () => {
      const invalidData = { ...validData, currentQuantity: 200 };

      await expect(service.createItem(invalidData)).rejects.toThrow(
        StockMessage.INVALID_QUANTITY_RANGE,
      );
    });

    it('deve lançar erro do builder quando o nome for muito curto', async () => {
      const invalidData = { ...validData, name: 'A' };

      await expect(service.createItem(invalidData)).rejects.toThrow();
    });
  });
  describe('updateItem', () => {
    it('deve atualizar quando os novos limites são válidos', async () => {
      const existing = buildItem({ currentQuantity: 50, minQuantity: 10, maxQuantity: 100 });
      stockRepository.findItemById.mockResolvedValue(existing);
      stockRepository.updateItem.mockResolvedValue(existing);

      await service.updateItem('item-1', { minQuantity: 20 });

      expect(stockRepository.updateItem).toHaveBeenCalledWith('item-1', {
        minQuantity: 20,
      });
    });

    it('deve lançar NotFoundException quando o item não existir', async () => {
      stockRepository.findItemById.mockResolvedValue(null);

      await expect(
        service.updateItem('id-inexistente', { minQuantity: 20 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando minQuantity >= maxQuantity', async () => {
      const existing = buildItem({ currentQuantity: 50, minQuantity: 10, maxQuantity: 100 });
      stockRepository.findItemById.mockResolvedValue(existing);

      await expect(
        service.updateItem('item-1', { minQuantity: 100, maxQuantity: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com a mensagem de min/max inválido', async () => {
      const existing = buildItem({ currentQuantity: 50, minQuantity: 10, maxQuantity: 100 });
      stockRepository.findItemById.mockResolvedValue(existing);

      await expect(
        service.updateItem('item-1', { minQuantity: 150 }),
      ).rejects.toThrow(StockMessage.INVALID_MIN_MAX);
    });

    it('deve lançar BadRequestException quando o novo range quebra mín < atual < máx', async () => {
      const existing = buildItem({ currentQuantity: 50, minQuantity: 10, maxQuantity: 100 });
      stockRepository.findItemById.mockResolvedValue(existing);

      await expect(
        service.updateItem('item-1', { minQuantity: 60 }),
      ).rejects.toThrow(StockMessage.INVALID_QUANTITY_RANGE);
    });

    it('deve lançar NotFoundException quando o repositório não encontrar o item ao salvar', async () => {
      const existing = buildItem({ currentQuantity: 50, minQuantity: 10, maxQuantity: 100 });
      stockRepository.findItemById.mockResolvedValue(existing);
      stockRepository.updateItem.mockResolvedValue(null);

      await expect(
        service.updateItem('item-1', { minQuantity: 20 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('deve excluir com sucesso quando o item existir', async () => {
      stockRepository.deleteItem.mockResolvedValue(true);

      await service.deleteItem('item-1');

      expect(stockRepository.deleteItem).toHaveBeenCalledWith('item-1');
    });

    it('deve lançar NotFoundException quando o item não existir', async () => {
      stockRepository.deleteItem.mockResolvedValue(false);

      await expect(service.deleteItem('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('registerMovement', () => {
    const movementData = {
      stockItemId: 'item-1',
      type: 'entrada' as const,
      quantity: 20,
      reason: 'Reposição semanal',
    };

    it('deve registrar movimentação de entrada com sucesso', async () => {
      const item = buildItem({ currentQuantity: 50, status: 'ok' });
      const createdMovement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('entrada')
        .withQuantity(20)
        .build();

      stockRepository.findItemById.mockResolvedValue(item);
      stockRepository.registerMovement.mockResolvedValue(createdMovement);

      const result = await service.registerMovement(movementData, 'admin-1');

      expect(stockRepository.registerMovement).toHaveBeenCalled();
      expect(result).toBe(createdMovement);
    });

    it('deve lançar NotFoundException quando o item não existir', async () => {
      stockRepository.findItemById.mockResolvedValue(null);

      await expect(
        service.registerMovement(movementData, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando a saída exceder o saldo', async () => {
      const item = buildItem({ currentQuantity: 10 });
      stockRepository.findItemById.mockResolvedValue(item);

      const saidaData = { ...movementData, type: 'saida' as const, quantity: 50 };

      await expect(
        service.registerMovement(saidaData, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com a mensagem de saldo insuficiente', async () => {
      const item = buildItem({ currentQuantity: 10 });
      stockRepository.findItemById.mockResolvedValue(item);

      const saidaData = { ...movementData, type: 'saida' as const, quantity: 50 };

      await expect(
        service.registerMovement(saidaData, 'admin-1'),
      ).rejects.toThrow(StockMessage.INSUFFICIENT_STOCK);
    });

    it('deve permitir saída quando a quantidade é exatamente igual ao saldo', async () => {
      const item = buildItem({ currentQuantity: 10 });
      const createdMovement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('saida')
        .withQuantity(10)
        .build();

      stockRepository.findItemById.mockResolvedValue(item);
      stockRepository.registerMovement.mockResolvedValue(createdMovement);

      const saidaData = { ...movementData, type: 'saida' as const, quantity: 10 };

      const result = await service.registerMovement(saidaData, 'admin-1');

      expect(result).toBe(createdMovement);
    });

    it('deve disparar alerta quando o item ficar crítico após a movimentação', async () => {
      const itemBefore = buildItem({ currentQuantity: 50, status: 'ok' });
      const itemAfter = buildItem({ currentQuantity: 2, status: 'crit' });
      const createdMovement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('saida')
        .withQuantity(48)
        .build();

   
      stockRepository.findItemById
        .mockResolvedValueOnce(itemBefore)
        .mockResolvedValueOnce(itemAfter);
      stockRepository.registerMovement.mockResolvedValue(createdMovement);

      const saidaData = { ...movementData, type: 'saida' as const, quantity: 48 };
      await service.registerMovement(saidaData, 'admin-1');

      expect(alertEngine.raiseCriticalStockAlert).toHaveBeenCalledWith({
        itemId: 'item-1',
        itemName: itemAfter.name,
        currentQuantity: itemAfter.currentQuantity,
        minQuantity: itemAfter.minQuantity,
        unit: itemAfter.unit,
      });
    });

    it('não deve disparar alerta quando o item não estiver crítico após a movimentação', async () => {
      const item = buildItem({ currentQuantity: 50, status: 'ok' });
      const createdMovement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('entrada')
        .withQuantity(20)
        .build();

      stockRepository.findItemById.mockResolvedValue(item);
      stockRepository.registerMovement.mockResolvedValue(createdMovement);

      await service.registerMovement(movementData, 'admin-1');

      expect(alertEngine.raiseCriticalStockAlert).not.toHaveBeenCalled();
    });

    it('não deve quebrar a movimentação quando o alertEngine falhar (best-effort)', async () => {
      const item = buildItem({ currentQuantity: 2, status: 'crit' });
      const createdMovement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('entrada')
        .withQuantity(20)
        .build();

      stockRepository.findItemById.mockResolvedValue(item);
      stockRepository.registerMovement.mockResolvedValue(createdMovement);
      alertEngine.raiseCriticalStockAlert.mockRejectedValue(
        new Error('Falha no engine de alertas'),
      );

      const result = await service.registerMovement(movementData, 'admin-1');

      expect(result).toBe(createdMovement);
    });
  });
  describe('listMovements', () => {
    it('deve calcular skip corretamente e montar a paginação', async () => {
      const movement = new StockMovementBuilder()
        .withId('mov-1')
        .withStockItemId('item-1')
        .withType('entrada')
        .withQuantity(10)
        .build();
      stockRepository.findMovements.mockResolvedValue({
        rows: [movement],
        total: 30,
      });

      const filters = { stockItemId: 'item-1' };
      const result = await service.listMovements(filters, 3, 10);

      expect(stockRepository.findMovements).toHaveBeenCalledWith(
        filters,
        20,
        10,
      );
      expect(result.data).toEqual([movement]);
      expect(result.total).toBe(30);
      expect(result.totalPages).toBe(3); 
    });

    it('deve repassar filtros vazios quando não informados', async () => {
      stockRepository.findMovements.mockResolvedValue({ rows: [], total: 0 });

      await service.listMovements({}, 1, 10);

      expect(stockRepository.findMovements).toHaveBeenCalledWith({}, 0, 10);
    });
  });
});