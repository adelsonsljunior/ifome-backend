import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  Confirmation,
  MealPeriod,
} from '../../../core/domain/entities/confirmation';
import { ConfirmationReadModel } from '../../../core/domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from '../../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import {
  IConfirmationRepository,
  MealForConfirmation,
  PagedResult,
} from '../../../core/interfaces/secondary/confirmation.repository.interface';
import { RecentConfirmationsOrder } from '../../../core/interfaces/primary/confirmation.use-cases.interface';
import { ConfirmationPrismaMapper } from '../prisma/mappers/confirmation.mappers';
import { RecentConfirmationPrismaMapper } from '../prisma/mappers/recent-confirmation.mappers';

// Projeção da confirmação com a refeição (período/data) para as rotas do aluno.
const CONFIRMATION_SELECT = {
  id: true,
  mealId: true,
  type: true,
  confirmedAt: true,
  meal: { select: { date: true, period: true } },
} as const;

// Implementação Prisma do repositório de confirmações.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class ConfirmationRepository implements IConfirmationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMealByDateAndPeriod(
    date: Date,
    period: MealPeriod,
  ): Promise<MealForConfirmation | null> {
    const row = await this.prisma.meal.findUnique({
      where: { date_period: { date, period } },
      select: {
        id: true,
        date: true,
        period: true,
        capacity: true,
      },
    });
    return row ? ConfirmationPrismaMapper.toMealForConfirmation(row) : null;
  }

  async countByMeal(mealId: string, exceptUserId?: string): Promise<number> {
    return this.prisma.confirmation.count({
      where: {
        mealId,
        canceledAt: null,
        ...(exceptUserId && { NOT: { userId: exceptUserId } }),
      },
    });
  }

  async upsert(confirmation: Confirmation): Promise<ConfirmationReadModel> {
    const row = await this.prisma.confirmation.upsert({
      where: {
        userId_mealId: {
          userId: confirmation.userId,
          mealId: confirmation.mealId,
        },
      },
      // não envia `id`: o banco gera via uuidv7().
      create: {
        userId: confirmation.userId,
        mealId: confirmation.mealId,
        type: confirmation.type,
      },
      // re-confirmar atualiza o tipo e renova o registro.
      update: {
        type: confirmation.type,
        confirmedAt: new Date(),
        canceledAt: null,
      },
      select: CONFIRMATION_SELECT,
    });
    return ConfirmationPrismaMapper.toReadModel(row);
  }

  async findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<ConfirmationReadModel | null> {
    const row = await this.prisma.confirmation.findFirst({
      where: { userId, canceledAt: null, meal: { date } },
      orderBy: { confirmedAt: 'desc' },
      select: CONFIRMATION_SELECT,
    });
    return row ? ConfirmationPrismaMapper.toReadModel(row) : null;
  }

  async findByUserAndMeal(
    userId: string,
    mealId: string,
  ): Promise<ConfirmationReadModel | null> {
    const row = await this.prisma.confirmation.findFirst({
      where: { userId, mealId, canceledAt: null },
      select: CONFIRMATION_SELECT,
    });
    return row ? ConfirmationPrismaMapper.toReadModel(row) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.confirmation.delete({ where: { id } });
  }

  async findRecent(
    skip: number,
    take: number,
    order: RecentConfirmationsOrder,
  ): Promise<PagedResult<RecentConfirmationReadModel>> {
    // newest = mais recentes primeiro; oldest = mais antigas primeiro.
    const ORDER_BY = {
      newest: { confirmedAt: 'desc' },
      oldest: { confirmedAt: 'asc' },
    } as const;
    const where = { canceledAt: null };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.confirmation.findMany({
        where,
        orderBy: ORDER_BY[order],
        skip,
        take,
        select: {
          id: true,
          userId: true,
          type: true,
          confirmedAt: true,
          user: { select: { name: true, enrollment: true } },
          meal: { select: { date: true, period: true } },
        },
      }),
      this.prisma.confirmation.count({ where }),
    ]);

    return {
      rows: rows.map((row) => RecentConfirmationPrismaMapper.toReadModel(row)),
      total,
    };
  }
}
