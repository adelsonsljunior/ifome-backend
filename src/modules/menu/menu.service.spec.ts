/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import {
  MENU_REPOSITORY,
  IMenuRepository,
} from './core/interfaces/secondary/menu.repository.interface';
import {
  NOTIFICATION_ENGINE,
  INotificationEngine,
} from '../notifications/core/interfaces/primary/notification-engine.interface';
import {
  MenuDayReadModel,
  MealView,
} from './core/domain/read-models/menu-day/menu-day.read-model';
import { DishBuilder } from './core/domain/entities/dish';
import { MealBuilder } from './core/domain/entities/meal';
import { MenuMessage } from './core/message/menu.message';

describe('MenuService', () => {
  let service: MenuService;
  let menuRepository: jest.Mocked<IMenuRepository>;
  let notificationEngine: jest.Mocked<INotificationEngine>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IMenuRepository> = {
      findMenu: jest.fn(),
      findDishById: jest.fn(),
      findDishesByIds: jest.fn(),
      createDish: jest.fn(),
      updateDish: jest.fn(),
      deleteDish: jest.fn(),
      findMealByDateAndPeriod: jest.fn(),
      createMeal: jest.fn(),
      updateMeal: jest.fn(),
    };

    const mockNotificationEngine: jest.Mocked<INotificationEngine> = {
      notifyUser: jest.fn(),
      notifyStudents: jest.fn(),
      notifyAdmins: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: MENU_REPOSITORY, useValue: mockRepository },
        { provide: NOTIFICATION_ENGINE, useValue: mockNotificationEngine },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    menuRepository = module.get(MENU_REPOSITORY);
    notificationEngine = module.get(NOTIFICATION_ENGINE);
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function buildDish(id = 'dish-1') {
    return new DishBuilder()
      .withId(id)
      .withName('Arroz Integral')
      .withDescription('Arroz integral cozido')
      .withCategory('base')
      .withRestrictions(['vegan', 'glutenFree'])
      .build();
  }

  function buildMeal(overrides?: {
    id?: string;
    date?: Date;
    period?: 'breakfast' | 'lunch' | 'dinner';
  }) {
    return new MealBuilder()
      .withId(overrides?.id ?? 'meal-1')
      .withDate(overrides?.date ?? new Date('2099-12-31T00:00:00.000Z'))
      .withPeriod(overrides?.period ?? 'lunch')
      .withStartTime('11:00')
      .withEndTime('13:00')
      .withCapacity(200)
      .withDishes([{ dishId: 'dish-1', order: 1 }])
      .build();
  }

  /** Data no futuro (amanhã UTC), no formato 'YYYY-MM-DD' */
  function futureDateStr(): string {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  /** Data de hoje em UTC no formato 'YYYY-MM-DD' */
  function todayDateStr(): string {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
      .toISOString()
      .slice(0, 10);
  }

  /** Data no passado (ontem UTC) no formato 'YYYY-MM-DD' */
  function pastDateStr(): string {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  }

  // ─── getToday ────────────────────────────────────────────────────────────────

  describe('getToday', () => {
    it('deve retornar o dia quando o repositório encontrar refeições hoje', async () => {
      const today = new Date(
        Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
        ),
      );
      const day = new MenuDayReadModel(today, [
        new MealView('meal-1', 'lunch', '11:00', '13:00', 200, 80, []),
      ]);
      menuRepository.findMenu.mockResolvedValue([day]);

      const result = await service.getToday();

      expect(result).toBe(day);
    });

    it('deve retornar MenuDayReadModel vazio quando não há refeições hoje', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      const result = await service.getToday();

      expect(result.meals).toHaveLength(0);
    });

    it('deve chamar findMenu com start=today e end=today', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      await service.getToday();

      const [start, end] = menuRepository.findMenu.mock.calls[0];
      expect(start.toISOString().slice(0, 10)).toBe(todayDateStr());
      expect(end.toISOString().slice(0, 10)).toBe(todayDateStr());
    });
  });

  // ─── getWeek ─────────────────────────────────────────────────────────────────

  describe('getWeek', () => {
    it('deve sempre retornar exatamente 7 dias', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      const result = await service.getWeek();

      expect(result).toHaveLength(7);
    });

    it('deve preencher dias sem refeição com MenuDayReadModel de meals vazio', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      const result = await service.getWeek();

      result.forEach((day) => expect(day.meals).toHaveLength(0));
    });

    it('deve inserir o dia com refeição na posição correta da semana', async () => {
      const today = new Date(
        Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
        ),
      );
      const todayMenu = new MenuDayReadModel(today, [
        new MealView('meal-1', 'lunch', '11:00', '13:00', 200, 80, []),
      ]);
      menuRepository.findMenu.mockResolvedValue([todayMenu]);

      const result = await service.getWeek();

      expect(result[0].meals).toHaveLength(1);
      expect(result[0]).toBe(todayMenu);
      for (let i = 1; i < 7; i++) {
        expect(result[i].meals).toHaveLength(0);
      }
    });

    it('deve repassar o filtro dietético ao repositório quando informado', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      await service.getWeek('vegan');

      expect(menuRepository.findMenu).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        'vegan',
      );
    });

    it('deve chamar findMenu sem filtro quando nenhum for passado', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      await service.getWeek();

      expect(menuRepository.findMenu).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        undefined,
      );
    });

    it('deve cobrir exatamente 7 dias a partir de hoje (start=today, end=today+6)', async () => {
      menuRepository.findMenu.mockResolvedValue([]);

      await service.getWeek();

      const [start, end] = menuRepository.findMenu.mock.calls[0];
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(6);
      expect(start.toISOString().slice(0, 10)).toBe(todayDateStr());
    });
  });

  // ─── getDishById ──────────────────────────────────────────────────────────────

  describe('getDishById', () => {
    it('deve retornar o prato quando encontrado', async () => {
      const dish = buildDish();
      menuRepository.findDishById.mockResolvedValue(dish);

      const result = await service.getDishById('dish-1');

      expect(menuRepository.findDishById).toHaveBeenCalledWith('dish-1');
      expect(result).toBe(dish);
    });

    it('deve lançar NotFoundException quando o prato não existir', async () => {
      menuRepository.findDishById.mockResolvedValue(null);

      await expect(service.getDishById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      menuRepository.findDishById.mockResolvedValue(null);

      await expect(service.getDishById('id-inexistente')).rejects.toThrow(
        MenuMessage.DISH_NOT_FOUND,
      );
    });
  });

  // ─── createDish ───────────────────────────────────────────────────────────────

  describe('createDish', () => {
    const validData = {
      name: 'Frango Grelhado',
      description: 'Peito de frango grelhado',
      category: 'protein' as const,
      restrictions: [] as const[],
    };

    it('deve delegar ao repositório e retornar o prato criado', async () => {
      const dish = buildDish();
      menuRepository.createDish.mockResolvedValue(dish);

      const result = await service.createDish(validData);

      expect(menuRepository.createDish).toHaveBeenCalledWith(validData);
      expect(result).toBe(dish);
    });
  });

  // ─── updateDish ───────────────────────────────────────────────────────────────

  describe('updateDish', () => {
    it('deve retornar o prato atualizado quando encontrado', async () => {
      const dish = buildDish();
      menuRepository.updateDish.mockResolvedValue(dish);

      const result = await service.updateDish('dish-1', { name: 'Novo Nome' });

      expect(menuRepository.updateDish).toHaveBeenCalledWith('dish-1', {
        name: 'Novo Nome',
      });
      expect(result).toBe(dish);
    });

    it('deve lançar NotFoundException quando o prato não existir', async () => {
      menuRepository.updateDish.mockResolvedValue(null);

      await expect(
        service.updateDish('id-inexistente', { name: 'Novo Nome' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      menuRepository.updateDish.mockResolvedValue(null);

      await expect(service.updateDish('id-inexistente', {})).rejects.toThrow(
        MenuMessage.DISH_NOT_FOUND,
      );
    });
  });

  // ─── deleteDish ───────────────────────────────────────────────────────────────

  describe('deleteDish', () => {
    it('deve excluir com sucesso quando o prato existir', async () => {
      menuRepository.deleteDish.mockResolvedValue(true);

      await service.deleteDish('dish-1');

      expect(menuRepository.deleteDish).toHaveBeenCalledWith('dish-1');
    });

    it('deve lançar NotFoundException quando o prato não existir', async () => {
      menuRepository.deleteDish.mockResolvedValue(false);

      await expect(service.deleteDish('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      menuRepository.deleteDish.mockResolvedValue(false);

      await expect(service.deleteDish('id-inexistente')).rejects.toThrow(
        MenuMessage.DISH_NOT_FOUND,
      );
    });
  });

  // ─── createMeal ───────────────────────────────────────────────────────────────

  describe('createMeal', () => {
    function validCreateMealData(dateStr?: string) {
      return {
        date: dateStr ?? futureDateStr(),
        period: 'lunch' as const,
        startTime: '11:00',
        endTime: '13:00',
        capacity: 200,
        dishes: [{ dishId: 'dish-1', order: 1 }],
      };
    }

    it('deve lançar BadRequestException quando a data não for futura (data de hoje)', async () => {
      await expect(
        service.createMeal(validCreateMealData(todayDateStr())),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com a mensagem correta para data não futura', async () => {
      await expect(
        service.createMeal(validCreateMealData(todayDateStr())),
      ).rejects.toThrow(MenuMessage.DATE_NOT_IN_FUTURE);
    });

    it('deve lançar BadRequestException quando a data for passada', async () => {
      await expect(
        service.createMeal(validCreateMealData(pastDateStr())),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando um prato informado não existir', async () => {
      // Repositório retorna 0 pratos para 1 dishId solicitado
      menuRepository.findDishesByIds.mockResolvedValue([]);

      await expect(service.createMeal(validCreateMealData())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException com a mensagem correta para prato inexistente', async () => {
      menuRepository.findDishesByIds.mockResolvedValue([]);

      await expect(service.createMeal(validCreateMealData())).rejects.toThrow(
        MenuMessage.DISHES_NOT_FOUND,
      );
    });

    it('deve lançar BadRequestException quando apenas parte dos pratos existir', async () => {
      // 2 dishIds mas repositório retorna só 1
      const data = {
        ...validCreateMealData(),
        dishes: [
          { dishId: 'dish-1', order: 1 },
          { dishId: 'dish-2', order: 2 },
        ],
      };
      menuRepository.findDishesByIds.mockResolvedValue([buildDish('dish-1')]);

      await expect(service.createMeal(data)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar ConflictException quando já existir refeição no período', async () => {
      const existingMeal = buildMeal();
      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(existingMeal);

      await expect(service.createMeal(validCreateMealData())).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException com a mensagem correta', async () => {
      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(buildMeal());

      await expect(service.createMeal(validCreateMealData())).rejects.toThrow(
        MenuMessage.MEAL_ALREADY_EXISTS,
      );
    });

    it('deve criar a refeição e retorná-la quando tudo for válido', async () => {
      const meal = buildMeal();
      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(meal);
      notificationEngine.notifyStudents.mockResolvedValue(undefined);

      const result = await service.createMeal(validCreateMealData());

      expect(menuRepository.createMeal).toHaveBeenCalledWith(
        validCreateMealData(),
      );
      expect(result).toBe(meal);
    });

    it('deve notificar alunos após criar a refeição com sucesso', async () => {
      const meal = buildMeal();
      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(meal);
      notificationEngine.notifyStudents.mockResolvedValue(undefined);

      await service.createMeal(validCreateMealData());

      expect(notificationEngine.notifyStudents).toHaveBeenCalledTimes(1);
      const payload = notificationEngine.notifyStudents.mock.calls[0][0];
      expect(payload.icon).toBe('calendar');
      expect(payload.title).toBe('Novo cardápio disponível');
      expect(payload.body).toContain('almoço');
    });

    it('deve retornar a refeição mesmo quando a notificação falhar (best-effort)', async () => {
      const meal = buildMeal();
      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(meal);
      notificationEngine.notifyStudents.mockRejectedValue(
        new Error('Falha no motor de notificações'),
      );

      const result = await service.createMeal(validCreateMealData());

      expect(result).toBe(meal);
    });

    it('deve deduplicar dishIds antes de validar existência', async () => {
      // Mesmo prato repetido duas vezes → findDishesByIds chamado com array deduplicado
      const data = {
        ...validCreateMealData(),
        dishes: [
          { dishId: 'dish-1', order: 1 },
          { dishId: 'dish-1', order: 2 },
        ],
      };
      menuRepository.findDishesByIds.mockResolvedValue([buildDish('dish-1')]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(buildMeal());
      notificationEngine.notifyStudents.mockResolvedValue(undefined);

      await service.createMeal(data);

      // Deve chamar com ['dish-1'] (sem duplicata), não ['dish-1', 'dish-1']
      expect(menuRepository.findDishesByIds).toHaveBeenCalledWith(['dish-1']);
    });

    it('deve usar rótulo correto para "breakfast" na notificação', async () => {
      const meal = new MealBuilder()
        .withId('meal-1')
        .withDate(new Date('2099-12-31T00:00:00.000Z'))
        .withPeriod('breakfast')
        .withStartTime('07:00')
        .withEndTime('09:00')
        .withCapacity(100)
        .build();

      const data = {
        date: futureDateStr(),
        period: 'breakfast' as const,
        startTime: '07:00',
        endTime: '09:00',
        capacity: 100,
        dishes: [{ dishId: 'dish-1', order: 1 }],
      };

      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(meal);
      notificationEngine.notifyStudents.mockResolvedValue(undefined);

      await service.createMeal(data);

      const payload = notificationEngine.notifyStudents.mock.calls[0][0];
      expect(payload.body).toContain('café da manhã');
    });

    it('deve usar rótulo correto para "dinner" na notificação', async () => {
      const meal = new MealBuilder()
        .withId('meal-1')
        .withDate(new Date('2099-12-31T00:00:00.000Z'))
        .withPeriod('dinner')
        .withStartTime('18:00')
        .withEndTime('20:00')
        .withCapacity(100)
        .build();

      const data = {
        date: futureDateStr(),
        period: 'dinner' as const,
        startTime: '18:00',
        endTime: '20:00',
        capacity: 100,
        dishes: [{ dishId: 'dish-1', order: 1 }],
      };

      menuRepository.findDishesByIds.mockResolvedValue([buildDish()]);
      menuRepository.findMealByDateAndPeriod.mockResolvedValue(null);
      menuRepository.createMeal.mockResolvedValue(meal);
      notificationEngine.notifyStudents.mockResolvedValue(undefined);

      await service.createMeal(data);

      const payload = notificationEngine.notifyStudents.mock.calls[0][0];
      expect(payload.body).toContain('jantar');
    });
  });

  // ─── updateMeal ───────────────────────────────────────────────────────────────

  describe('updateMeal', () => {
    it('deve retornar a refeição atualizada quando encontrada (sem dishes)', async () => {
      const meal = buildMeal();
      menuRepository.updateMeal.mockResolvedValue(meal);

      const result = await service.updateMeal('meal-1', { capacity: 300 });

      expect(menuRepository.updateMeal).toHaveBeenCalledWith('meal-1', {
        capacity: 300,
      });
      expect(result).toBe(meal);
    });

    it('deve lançar NotFoundException quando a refeição não existir', async () => {
      menuRepository.updateMeal.mockResolvedValue(null);

      await expect(
        service.updateMeal('id-inexistente', { capacity: 300 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      menuRepository.updateMeal.mockResolvedValue(null);

      await expect(service.updateMeal('id-inexistente', {})).rejects.toThrow(
        MenuMessage.MEAL_NOT_FOUND,
      );
    });

    it('deve validar existência dos pratos quando dishes for informado', async () => {
      menuRepository.findDishesByIds.mockResolvedValue([buildDish('dish-1')]);
      menuRepository.updateMeal.mockResolvedValue(buildMeal());

      await service.updateMeal('meal-1', {
        dishes: [{ dishId: 'dish-1', order: 1 }],
      });

      expect(menuRepository.findDishesByIds).toHaveBeenCalledWith(['dish-1']);
    });

    it('deve lançar BadRequestException quando um prato em dishes não existir', async () => {
      menuRepository.findDishesByIds.mockResolvedValue([]);

      await expect(
        service.updateMeal('meal-1', {
          dishes: [{ dishId: 'dish-inexistente', order: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('não deve chamar findDishesByIds quando dishes não for informado', async () => {
      menuRepository.updateMeal.mockResolvedValue(buildMeal());

      await service.updateMeal('meal-1', { capacity: 150 });

      expect(menuRepository.findDishesByIds).not.toHaveBeenCalled();
    });

    it('não deve chamar findDishesByIds quando dishes for undefined', async () => {
      menuRepository.updateMeal.mockResolvedValue(buildMeal());

      await service.updateMeal('meal-1', {});

      expect(menuRepository.findDishesByIds).not.toHaveBeenCalled();
    });
  });
});
