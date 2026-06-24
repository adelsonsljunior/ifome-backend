import { Inject, Injectable } from '@nestjs/common';
import {
  DashboardReadModel,
  DashboardStats,
} from './core/domain/read-models/dashboard/dashboard.read-model';
import { IDashboardUseCases } from './core/interfaces/primary/dashboard.use-cases.interface';
import { MenuDayReadModel } from '../menu/core/domain/read-models/menu-day/menu-day.read-model';
import {
  MENU_USECASES,
  type IMenuUseCases,
} from '../menu/core/interfaces/primary/menu.use-cases.interface';
import {
  ALERT_USECASES,
  type IAlertUseCases,
} from '../alerts/core/interfaces/primary/alert.use-cases.interface';
import {
  STOCK_USECASES,
  type IStockUseCases,
} from '../stock/core/interfaces/primary/stock.use-cases.interface';
import {
  CONFIRMATION_USECASES,
  type IConfirmationUseCases,
} from '../confirmations/core/interfaces/primary/confirmation.use-cases.interface';

// Limites das seções do painel (busca a 1ª página de cada port).
const RECENT_ALERTS = 6;
const RECENT_CONFIRMATIONS = 5;
const SHORTAGE_LIMIT = 1000; // itens em falta cabem com folga
const DEMAND_LIMIT = 100; // 7 dias × 3 períodos = no máximo 21 pontos

@Injectable()
export class DashboardService implements IDashboardUseCases {
  constructor(
    @Inject(MENU_USECASES) private readonly menu: IMenuUseCases,
    @Inject(ALERT_USECASES) private readonly alerts: IAlertUseCases,
    @Inject(STOCK_USECASES) private readonly stock: IStockUseCases,
    @Inject(CONFIRMATION_USECASES)
    private readonly confirmations: IConfirmationUseCases,
  ) {}

  async getDashboard(): Promise<DashboardReadModel> {
    const [menuToday, alertsPage, critPage, lowPage, demandPage, recentPage] =
      await Promise.all([
        this.menu.getToday(),
        this.alerts.listAlerts('all', 1, RECENT_ALERTS),
        this.stock.listItems('crit', 1, SHORTAGE_LIMIT),
        this.stock.listItems('low', 1, SHORTAGE_LIMIT),
        this.alerts.getDemand7Days(1, DEMAND_LIMIT),
        this.confirmations.getRecent(1, RECENT_CONFIRMATIONS, 'newest'),
      ]);

    // Itens em falta: críticos primeiro, depois baixos.
    const stock = [...critPage.data, ...lowPage.data];

    return new DashboardReadModel(
      menuToday,
      this.computeStats(menuToday),
      alertsPage.data,
      stock,
      demandPage.data,
      recentPage.data,
    );
  }

  // Estatísticas agregadas das refeições de hoje.
  private computeStats(menu: MenuDayReadModel): DashboardStats {
    const totalCapacity = menu.meals.reduce(
      (sum, meal) => sum + meal.capacity,
      0,
    );
    const totalConfirmed = menu.meals.reduce(
      (sum, meal) => sum + meal.confirmedCount,
      0,
    );
    return new DashboardStats(menu.meals.length, totalCapacity, totalConfirmed);
  }
}
