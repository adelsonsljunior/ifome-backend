import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Dish, DietaryType } from './core/domain/entities/dish';
import { Meal } from './core/domain/entities/meal';
import { MenuDayReadModel } from './core/domain/read-models/menu-day/menu-day.read-model';
import {
  CreateDishData,
  CreateMealData,
  IMenuUseCases,
  UpdateDishData,
  UpdateMealData,
} from './core/interfaces/primary/menu.use-cases.interface';
import {
  MENU_REPOSITORY,
  type IMenuRepository,
} from './core/interfaces/secondary/menu.repository.interface';
import { MenuMessage } from './core/message/menu.message';

// Quantidade de dias retornados pelo cardápio da semana.
const WEEK_DAYS = 7;

@Injectable()
export class MenuService implements IMenuUseCases {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: IMenuRepository,
  ) {}

  async getToday(): Promise<MenuDayReadModel> {
    const today = this.todayUtc();
    const days = await this.menuRepository.findMenu(today, today);
    return days[0] ?? new MenuDayReadModel(today, []);
  }

  async getWeek(filter?: DietaryType): Promise<MenuDayReadModel[]> {
    const start = this.todayUtc();
    const end = this.addDays(start, WEEK_DAYS - 1);
    const days = await this.menuRepository.findMenu(start, end, filter);
    const byKey = new Map(days.map((day) => [this.dateKey(day.date), day]));

    // Sempre devolve os 7 dias; dias sem refeição vêm com `meals` vazio.
    return Array.from({ length: WEEK_DAYS }, (_, offset) => {
      const date = this.addDays(start, offset);
      return byKey.get(this.dateKey(date)) ?? new MenuDayReadModel(date, []);
    });
  }

  async getDishById(id: string): Promise<Dish> {
    const dish = await this.menuRepository.findDishById(id);
    if (!dish) {
      this.logger.warn(`Dish ${id} not found`);
      throw new NotFoundException(MenuMessage.DISH_NOT_FOUND);
    }
    return dish;
  }

  async createDish(data: CreateDishData): Promise<Dish> {
    return this.menuRepository.createDish(data);
  }

  async updateDish(id: string, data: UpdateDishData): Promise<Dish> {
    const dish = await this.menuRepository.updateDish(id, data);
    if (!dish) {
      this.logger.warn(`Dish ${id} not found`);
      throw new NotFoundException(MenuMessage.DISH_NOT_FOUND);
    }
    return dish;
  }

  async deleteDish(id: string): Promise<void> {
    const deleted = await this.menuRepository.deleteDish(id);
    if (!deleted) {
      this.logger.warn(`Dish ${id} not found`);
      throw new NotFoundException(MenuMessage.DISH_NOT_FOUND);
    }
  }

  async createMeal(data: CreateMealData): Promise<Meal> {
    const date = this.assertFutureDate(data.date);
    await this.assertDishesExist(data.dishes.map((dish) => dish.dishId));

    const existing = await this.menuRepository.findMealByDateAndPeriod(
      date,
      data.period,
    );
    if (existing) {
      this.logger.warn(`Meal already exists for ${data.date} (${data.period})`);
      throw new ConflictException(MenuMessage.MEAL_ALREADY_EXISTS);
    }

    return this.menuRepository.createMeal(data);
  }

  async updateMeal(id: string, data: UpdateMealData): Promise<Meal> {
    if (data.dishes !== undefined) {
      await this.assertDishesExist(data.dishes.map((dish) => dish.dishId));
    }

    const meal = await this.menuRepository.updateMeal(id, data);
    if (!meal) {
      this.logger.warn(`Meal ${id} not found`);
      throw new NotFoundException(MenuMessage.MEAL_NOT_FOUND);
    }
    return meal;
  }

  // Garante que todos os pratos informados existem antes de agendar a refeição.
  private async assertDishesExist(dishIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(dishIds)];
    const dishes = await this.menuRepository.findDishesByIds(uniqueIds);
    if (dishes.length !== uniqueIds.length) {
      throw new BadRequestException(MenuMessage.DISHES_NOT_FOUND);
    }
  }

  // Valida que a data ('YYYY-MM-DD') é futura e devolve o Date (meia-noite UTC).
  private assertFutureDate(dateStr: string): Date {
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date <= this.todayUtc()) {
      throw new BadRequestException(MenuMessage.DATE_NOT_IN_FUTURE);
    }
    return date;
  }

  // Data de hoje em meia-noite UTC (a coluna do banco é @db.Date).
  private todayUtc(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private addDays(date: Date, days: number): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + days,
      ),
    );
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
