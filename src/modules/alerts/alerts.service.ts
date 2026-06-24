import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Alert, AlertBuilder } from './core/domain/entities/alert';
import { DemandPointReadModel } from './core/domain/read-models/demand-point/demand-point.read-model';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import {
  AlertFilter,
  IAlertUseCases,
} from './core/interfaces/primary/alert.use-cases.interface';
import {
  CriticalStockData,
  IAlertEngine,
} from './core/interfaces/primary/alert-engine.interface';
import {
  ALERT_REPOSITORY,
  AlertQueryFilter,
  type IAlertRepository,
} from './core/interfaces/secondary/alert.repository.interface';
import {
  AlertMessage,
  criticalStockAlertText,
} from './core/message/alert.message';
import {
  NOTIFICATION_ENGINE,
  type INotificationEngine,
} from '../notifications/core/interfaces/primary/notification-engine.interface';

// Janela do histórico de demanda exposto pela rota demand-7days.
const DEMAND_WINDOW_DAYS = 7;

@Injectable()
export class AlertsService implements IAlertUseCases, IAlertEngine {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @Inject(ALERT_REPOSITORY)
    private readonly alertRepository: IAlertRepository,
    @Inject(NOTIFICATION_ENGINE)
    private readonly notificationEngine: INotificationEngine,
  ) {}

  // ----- Casos de uso (HTTP) -----

  async listAlerts(
    filter: AlertFilter,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<Alert>> {
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.alertRepository.findAlerts(
      this.toQueryFilter(filter),
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }

  async unresolvedCount(): Promise<number> {
    return this.alertRepository.countUnresolved();
  }

  async resolveAlert(id: string, resolved: boolean): Promise<void> {
    const ok = await this.alertRepository.resolve(id, resolved);
    if (!ok) {
      this.logger.warn(`Alert ${id} not found on resolve`);
      throw new NotFoundException(AlertMessage.NOT_FOUND);
    }
  }

  async getDemand7Days(
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<DemandPointReadModel>> {
    const from = this.daysAgoUtc(DEMAND_WINDOW_DAYS - 1);
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.alertRepository.findDemandSince(
      from,
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }

  // ----- Engine (geração automática) -----

  async raiseCriticalStockAlert(data: CriticalStockData): Promise<void> {
    // Dedup: não duplica enquanto houver alerta de estoque crítico aberto do item.
    const existing = await this.alertRepository.findUnresolvedByTypeAndRelated(
      'criticalStock',
      data.itemId,
    );
    if (existing) return;

    const text = criticalStockAlertText(
      data.itemName,
      data.currentQuantity,
      data.minQuantity,
      data.unit,
    );
    const alert = new AlertBuilder()
      .withLevel('crit')
      .withType('criticalStock')
      .withTitle(text.title)
      .withBody(text.body)
      .withRelatedId(data.itemId)
      .build();

    await this.alertRepository.create(alert);
    await this.notificationEngine.notifyAdmins({
      icon: 'alert',
      title: text.title,
      body: text.body,
    });
  }

  // Traduz o filtro da API para o filtro de consulta do repositório.
  private toQueryFilter(filter: AlertFilter): AlertQueryFilter {
    if (filter === 'resolvidos') return { resolved: true };
    if (filter === 'all') return {};
    return { level: filter };
  }

  // Data de N dias atrás em meia-noite UTC (coluna DemandAnalytics.date é @db.Date).
  private daysAgoUtc(days: number): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - days),
    );
  }
}
