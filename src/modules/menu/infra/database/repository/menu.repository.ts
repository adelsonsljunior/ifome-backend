import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { DietaryType, Dish } from '../../../core/domain/entities/dish';
import { Meal, MealPeriod } from '../../../core/domain/entities/meal';
import { MenuDayReadModel } from '../../../core/domain/read-models/menu-day/menu-day.read-model';
import { IMenuRepository } from '../../../core/interfaces/secondary/menu.repository.interface';
import {
  CreateDishData,
  CreateMealData,
  UpdateDishData,
  UpdateMealData,
} from '../../../core/interfaces/primary/menu.use-cases.interface';
import { MenuMessage } from '../../../core/message/menu.message';
import { DishPrismaMapper } from '../prisma/mappers/dish.mappers';
import {
  MealPrismaMapper,
  stringToPrismaDate,
  stringToPrismaTime,
} from '../prisma/mappers/meal.mappers';
import { MenuDayPrismaMapper } from '../prisma/mappers/menu-day.mappers';

// Inclui as restrições do prato (relação DishRestriction).
const DISH_INCLUDE = { restrictions: { select: { type: true } } } as const;

// Inclui os pratos da refeição, ordenados pela ordem de exibição.
const MEAL_INCLUDE = {
  dishes: { orderBy: { order: 'asc' }, select: { dishId: true, order: true } },
} as const;

// Extrai o código de erro conhecido do Prisma (ex.: P2025, P2003) sem acoplar
// o tipo do client — a infra é a única camada que conhece esses códigos.
function prismaErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

// Implementação Prisma do repositório de cardápio.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class MenuRepository implements IMenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMenu(
    startDate: Date,
    endDate: Date,
    filter?: DietaryType,
  ): Promise<MenuDayReadModel[]> {
    // Com filtro, restringe os pratos àqueles que atendem à restrição informada.
    const dishWhere = filter
      ? { dish: { restrictions: { some: { type: filter } } } }
      : undefined;

    const rows = await this.prisma.meal.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      select: {
        id: true,
        date: true,
        period: true,
        startTime: true,
        endTime: true,
        capacity: true,
        // "confirmados" não é armazenado: contamos as confirmações ativas.
        _count: { select: { confirmations: { where: { canceledAt: null } } } },
        dishes: {
          where: dishWhere,
          orderBy: { order: 'asc' },
          select: {
            dish: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                restrictions: { select: { type: true } },
              },
            },
          },
        },
      },
    });

    return MenuDayPrismaMapper.toReadModels(rows);
  }

  async findDishById(id: string): Promise<Dish | null> {
    const row = await this.prisma.dish.findUnique({
      where: { id },
      include: DISH_INCLUDE,
    });
    return row ? DishPrismaMapper.toDomain(row) : null;
  }

  async findDishesByIds(ids: string[]): Promise<Dish[]> {
    const rows = await this.prisma.dish.findMany({
      where: { id: { in: ids } },
      include: DISH_INCLUDE,
    });
    return rows.map((row) => DishPrismaMapper.toDomain(row));
  }

  async createDish(data: CreateDishData): Promise<Dish> {
    const row = await this.prisma.dish.create({
      // não envia `id`: o banco gera via uuidv7().
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        restrictions: { create: data.restrictions.map((type) => ({ type })) },
      },
      include: DISH_INCLUDE,
    });
    return DishPrismaMapper.toDomain(row);
  }

  async updateDish(id: string, data: UpdateDishData): Promise<Dish | null> {
    try {
      // Substituição transacional: atualiza os campos e, se vierem restrições,
      // troca o conjunto inteiro (apaga as antigas, insere as novas).
      const row = await this.prisma.$transaction(async (tx) => {
        await tx.dish.update({
          where: { id },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
            ...(data.category !== undefined && { category: data.category }),
          },
        });

        if (data.restrictions !== undefined) {
          await tx.dishRestriction.deleteMany({ where: { dishId: id } });
          if (data.restrictions.length > 0) {
            await tx.dishRestriction.createMany({
              data: data.restrictions.map((type) => ({ dishId: id, type })),
              skipDuplicates: true,
            });
          }
        }

        return tx.dish.findUnique({ where: { id }, include: DISH_INCLUDE });
      });

      return row ? DishPrismaMapper.toDomain(row) : null;
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return null; // não encontrado
      throw error;
    }
  }

  async deleteDish(id: string): Promise<boolean> {
    try {
      await this.prisma.dish.delete({ where: { id } });
      return true;
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return false; // não encontrado
      // FK Restrict: o prato está em uma refeição agendada (MealDish).
      if (prismaErrorCode(error) === 'P2003')
        throw new ConflictException(MenuMessage.DISH_IN_USE);
      throw error;
    }
  }

  async findMealByDateAndPeriod(
    date: Date,
    period: MealPeriod,
  ): Promise<Meal | null> {
    const row = await this.prisma.meal.findUnique({
      where: { date_period: { date, period } },
      include: MEAL_INCLUDE,
    });
    return row ? MealPrismaMapper.toDomain(row) : null;
  }

  async createMeal(data: CreateMealData): Promise<Meal> {
    const row = await this.prisma.meal.create({
      // não envia `id`: o banco gera via uuidv7().
      data: {
        date: stringToPrismaDate(data.date),
        period: data.period,
        startTime: stringToPrismaTime(data.startTime),
        endTime: stringToPrismaTime(data.endTime),
        capacity: data.capacity,
        dishes: {
          create: data.dishes.map((dish) => ({
            dishId: dish.dishId,
            order: dish.order,
          })),
        },
      },
      include: MEAL_INCLUDE,
    });
    return MealPrismaMapper.toDomain(row);
  }

  async updateMeal(id: string, data: UpdateMealData): Promise<Meal | null> {
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        await tx.meal.update({
          where: { id },
          data: {
            ...(data.capacity !== undefined && { capacity: data.capacity }),
            ...(data.endTime !== undefined && {
              endTime: stringToPrismaTime(data.endTime),
            }),
          },
        });

        if (data.dishes !== undefined) {
          await tx.mealDish.deleteMany({ where: { mealId: id } });
          if (data.dishes.length > 0) {
            await tx.mealDish.createMany({
              data: data.dishes.map((dish) => ({
                mealId: id,
                dishId: dish.dishId,
                order: dish.order,
              })),
              skipDuplicates: true,
            });
          }
        }

        return tx.meal.findUnique({ where: { id }, include: MEAL_INCLUDE });
      });

      return row ? MealPrismaMapper.toDomain(row) : null;
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return null; // não encontrado
      throw error;
    }
  }
}
