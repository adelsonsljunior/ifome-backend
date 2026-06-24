import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Alert, AlertType } from '../../../core/domain/entities/alert';
import { DemandPointReadModel } from '../../../core/domain/read-models/demand-point/demand-point.read-model';
import {
  AlertQueryFilter,
  IAlertRepository,
  PagedResult,
} from '../../../core/interfaces/secondary/alert.repository.interface';
import {
  AlertPrismaMapper,
  levelToPrisma,
} from '../prisma/mappers/alert.mappers';

// Extrai o código de erro conhecido do Prisma (ex.: P2025) sem acoplar o tipo do client.
function prismaErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

// Implementação Prisma do repositório de alertas.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class AlertRepository implements IAlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAlerts(
    filter: AlertQueryFilter,
    skip: number,
    take: number,
  ): Promise<PagedResult<Alert>> {
    const where = {
      ...(filter.level && { level: levelToPrisma(filter.level) }),
      ...(filter.resolved !== undefined &&
        (filter.resolved
          ? { resolvedAt: { not: null } }
          : { resolvedAt: null })),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      rows: rows.map((row) => AlertPrismaMapper.toDomain(row)),
      total,
    };
  }

  async countUnresolved(): Promise<number> {
    return this.prisma.alert.count({ where: { resolvedAt: null } });
  }

  async resolve(id: string, resolved: boolean): Promise<boolean> {
    try {
      await this.prisma.alert.update({
        where: { id },
        data: { resolvedAt: resolved ? new Date() : null },
      });
      return true;
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') return false; // não encontrado
      throw error;
    }
  }

  async findUnresolvedByTypeAndRelated(
    type: AlertType,
    relatedId: string,
  ): Promise<Alert | null> {
    const row = await this.prisma.alert.findFirst({
      where: { type, relatedId, resolvedAt: null },
    });
    return row ? AlertPrismaMapper.toDomain(row) : null;
  }

  async create(alert: Alert): Promise<Alert> {
    const row = await this.prisma.alert.create({
      // não envia `id` (uuidv7()); resolvedAt nulo e readByAdmins [] por default.
      data: {
        level: levelToPrisma(alert.level),
        type: alert.type,
        title: alert.title,
        body: alert.body,
        relatedId: alert.relatedId ?? null,
      },
    });
    return AlertPrismaMapper.toDomain(row);
  }

  async findDemandSince(
    from: Date,
    skip: number,
    take: number,
  ): Promise<PagedResult<DemandPointReadModel>> {
    const where = { date: { gte: from } };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.demandAnalytics.findMany({
        where,
        orderBy: [{ date: 'asc' }, { period: 'asc' }],
        select: { date: true, period: true, confirmationCount: true },
        skip,
        take,
      }),
      this.prisma.demandAnalytics.count({ where }),
    ]);

    return {
      rows: rows.map(
        (row) =>
          new DemandPointReadModel(row.date, row.period, row.confirmationCount),
      ),
      total,
    };
  }
}
