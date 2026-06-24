import { MenuDayReadModel } from '../../../../../menu/core/domain/read-models/menu-day/menu-day.read-model';
import { Alert } from '../../../../../alerts/core/domain/entities/alert';
import { DemandPointReadModel } from '../../../../../alerts/core/domain/read-models/demand-point/demand-point.read-model';
import { StockItem } from '../../../../../stock/core/domain/entities/stock-item';
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
    public readonly alerts: Alert[],
    public readonly stock: StockItem[],
    public readonly demand7d: DemandPointReadModel[],
    public readonly recentConfirmations: RecentConfirmationReadModel[],
  ) {}
}
