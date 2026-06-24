import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { User } from '../../../core/domain/entities/user';
import { MealHistory } from '../../../core/domain/entities/meal-history';
import { RecentConfirmationReadModel } from '../../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import {
  IUserRepository,
  PagedResult,
} from '../../../core/interfaces/secondary/user.repository.interface';
import {
  RecentConfirmationsOrder,
  UpdateProfileData,
} from '../../../core/interfaces/primary/user.use-cases.interface';
import { UserPrismaMapper } from '../prisma/mappers/user.mappers';
import { MealHistoryPrismaMapper } from '../prisma/mappers/meal-history.mappers';
import { RecentConfirmationPrismaMapper } from '../prisma/mappers/recent-confirmation.mappers';

// Projeção segura do usuário (sem `password`), com as restrições alimentares.
const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  enrollment: true,
  role: true,
  campus: true,
  course: true,
  phone: true,
  dietaryRestrictions: { select: { type: true } },
  createdAt: true,
  updatedAt: true,
} as const;

// Implementação Prisma do repositório de usuários.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      // select explícito: nunca traz `password` quando não é necessário.
      select: {
        id: true,
        email: true,
        name: true,
        enrollment: true,
        role: true,
        campus: true,
        course: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findProfileById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: PROFILE_SELECT,
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async updateProfile(
    id: string,
    data: UpdateProfileData,
  ): Promise<User | null> {
    this.logger.log(`Updating profile for user ${id}`);

    // Substituição transacional: atualiza o telefone e, se vierem restrições,
    // troca o conjunto inteiro (apaga as antigas, insere as novas).
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { ...(data.phone !== undefined && { phone: data.phone }) },
      });

      if (data.restrictions !== undefined) {
        await tx.dietaryRestriction.deleteMany({ where: { userId: id } });
        if (data.restrictions.length > 0) {
          await tx.dietaryRestriction.createMany({
            data: data.restrictions.map((type) => ({ userId: id, type })),
            skipDuplicates: true,
          });
        }
      }

      return tx.user.findUnique({ where: { id }, select: PROFILE_SELECT });
    });

    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findMealHistoryPage(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PagedResult<MealHistory>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.mealHistory.findMany({
        where: { userId },
        orderBy: [{ date: 'desc' }, { recordedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.mealHistory.count({ where: { userId } }),
    ]);

    return {
      rows: rows.map((row) => MealHistoryPrismaMapper.toDomain(row)),
      total,
    };
  }

  async findRecentConfirmations(
    limit: number,
    order: RecentConfirmationsOrder,
  ): Promise<RecentConfirmationReadModel[]> {
    // 'recente' é a única ordenação suportada hoje: mais novas primeiro.
    const ORDER_BY = { recente: { confirmedAt: 'desc' } } as const;
    const rows = await this.prisma.confirmation.findMany({
      where: { canceledAt: null },
      orderBy: ORDER_BY[order],
      take: limit,
      select: {
        id: true,
        userId: true,
        type: true,
        confirmedAt: true,
        user: { select: { name: true, enrollment: true } },
        meal: { select: { date: true, period: true } },
      },
    });

    return rows.map((row) => RecentConfirmationPrismaMapper.toReadModel(row));
  }
}
