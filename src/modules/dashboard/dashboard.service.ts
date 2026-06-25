import { Inject, Injectable } from '@nestjs/common';
import {
  DashboardReadModel,
  DashboardStats,
} from './core/domain/read-models/dashboard/dashboard.read-model';
import { IDashboardUseCases } from './core/interfaces/primary/dashboard.use-cases.interface';
import {
  MealView,
  MenuDayReadModel,
} from '../menu/core/domain/read-models/menu-day/menu-day.read-model';
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

// Converte 'HH:mm' em minutos do dia.
const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

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
    const [
      menuToday,
      alertsPage,
      activeAlertsCount,
      critPage,
      lowPage,
      demand7d,
      recentPage,
    ] = await Promise.all([
      this.menu.getToday(),
      this.alerts.listAlerts('all', 1, RECENT_ALERTS),
      this.alerts.unresolvedCount(),
      this.stock.listItems('crit', 1, SHORTAGE_LIMIT),
      this.stock.listItems('low', 1, SHORTAGE_LIMIT),
      this.confirmations.getDemandLast7Days(),
      this.confirmations.getRecent(1, RECENT_CONFIRMATIONS, 'newest'),
    ]);

    // Itens em falta (status != ok): críticos primeiro, depois baixos.
    const stock = [...critPage.data, ...lowPage.data];
    const shortageItemsCount = critPage.total + lowPage.total;

    return new DashboardReadModel(
      menuToday,
      this.computeStats(menuToday),
      this.pickCurrentMeal(menuToday),
      alertsPage.data,
      activeAlertsCount,
      stock,
      shortageItemsCount,
      demand7d,
      recentPage.data,
    );
  }

  // Seleciona a refeição "de agora" pelo horário do servidor: a que está em curso
  // (start <= agora <= end); senão a próxima do dia; senão a última; senão null.
  private pickCurrentMeal(menu: MenuDayReadModel): MealView | null {
    if (menu.meals.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const meals = [...menu.meals].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
    );

    const active = meals.find(
      (meal) =>
        toMinutes(meal.startTime) <= nowMinutes &&
        nowMinutes <= toMinutes(meal.endTime),
    );
    if (active) return active;

    const upcoming = meals.find(
      (meal) => toMinutes(meal.startTime) > nowMinutes,
    );
    return upcoming ?? meals[meals.length - 1];
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
