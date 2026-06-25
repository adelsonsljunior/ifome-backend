import {
  MealView,
  MenuDayReadModel,
} from '../../../../../menu/core/domain/read-models/menu-day/menu-day.read-model';
import { Alert } from '../../../../../alerts/core/domain/entities/alert';
import { StockItem } from '../../../../../stock/core/domain/entities/stock-item';
import { DemandPoint } from '../../../../../confirmations/core/domain/read-models/demand/demand.read-model';
import { RecentConfirmationReadModel } from '../../../../../confirmations/core/domain/read-models/recent-confirmation/recent-confirmation.read-model';

// Estatísticas agregadas do cardápio do dia (todas as refeições de hoje).
// `totalConfirmed` ignora reservas canceladas (origem já filtra canceledAt = null).
export class DashboardStats {
  public readonly occupancyPercent: number;

  constructor(
    public readonly mealsCount: number,
    public readonly totalCapacity: number,
    public readonly totalConfirmed: number,
  ) {
    this.occupancyPercent =
      totalCapacity > 0
        ? Math.round((totalConfirmed / totalCapacity) * 100)
        : 0;
  }
}

// Read-model composto do painel administrativo. Read-only; agrega projeções de
// outros domínios (menu, alertas, estoque, confirmações).
export class DashboardReadModel {
  constructor(
    public readonly menuToday: MenuDayReadModel,
    public readonly stats: DashboardStats,
    // Refeição acontecendo agora (pelo horário do servidor), ou null.
    public readonly currentMeal: MealView | null,
    public readonly alerts: Alert[],
    // Total de alertas ativos (não resolvidos), para o card "Alertas Ativos".
    public readonly activeAlertsCount: number,
    public readonly stock: StockItem[],
    // Total de itens em falta (status != ok), para o card "Itens em Falta".
    public readonly shortageItemsCount: number,
    public readonly demand7d: DemandPoint[],
    public readonly recentConfirmations: RecentConfirmationReadModel[],
  ) {}
}
