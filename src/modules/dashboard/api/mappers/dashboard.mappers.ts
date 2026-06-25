import { DashboardReadModel } from '../../core/domain/read-models/dashboard/dashboard.read-model';
import { DashboardResponseDto } from '../dto/responses/dashboard-response.dto';
import { MealView } from '../../../menu/core/domain/read-models/menu-day/menu-day.read-model';
import { MenuMealResponseDto } from '../../../menu/api/dto/responses/menu-day-response.dto';
import { MenuApiMapper } from '../../../menu/api/mappers/menu.mappers';
import { AlertApiMapper } from '../../../alerts/api/mappers/alert.mappers';
import { StockApiMapper } from '../../../stock/api/mappers/stock.mappers';
import { ConfirmationApiMapper } from '../../../confirmations/api/mappers/confirmation.mappers';

// Formata um Date apenas como data (YYYY-MM-DD).
const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

// Compõe o payload do painel reusando os mappers de cada domínio.
export class DashboardApiMapper {
  static toResponse(data: DashboardReadModel): DashboardResponseDto {
    return {
      menuToday: {
        day: MenuApiMapper.toMenuDayResponse(data.menuToday),
        stats: {
          mealsCount: data.stats.mealsCount,
          totalCapacity: data.stats.totalCapacity,
          totalConfirmed: data.stats.totalConfirmed,
          occupancyPercent: data.stats.occupancyPercent,
        },
        currentMeal: data.currentMeal
          ? this.toMealResponse(data.currentMeal)
          : null,
      },
      alerts: data.alerts.map((alert) => AlertApiMapper.toResponse(alert)),
      activeAlertsCount: data.activeAlertsCount,
      stock: data.stock.map((item) => StockApiMapper.toItemResponse(item)),
      shortageItemsCount: data.shortageItemsCount,
      demand7d: data.demand7d.map((point) => ({
        date: toDateOnly(point.date),
        period: point.period,
        count: point.count,
      })),
      recentConfirmations: data.recentConfirmations.map((confirmation) =>
        ConfirmationApiMapper.toRecentConfirmationResponse(confirmation),
      ),
    };
  }

  // Converte a refeição em curso (read-model) -> DTO do donut.
  private static toMealResponse(meal: MealView): MenuMealResponseDto {
    return {
      id: meal.id,
      period: meal.period,
      startTime: meal.startTime,
      endTime: meal.endTime,
      capacity: meal.capacity,
      confirmedCount: meal.confirmedCount,
      usagePercent: meal.usagePercent,
      dishes: meal.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category,
        restrictions: dish.restrictions,
      })),
    };
  }
}
