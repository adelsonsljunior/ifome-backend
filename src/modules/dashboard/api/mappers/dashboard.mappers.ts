import { DashboardReadModel } from '../../core/domain/read-models/dashboard/dashboard.read-model';
import { DashboardResponseDto } from '../dto/responses/dashboard-response.dto';
import { MenuApiMapper } from '../../../menu/api/mappers/menu.mappers';
import { AlertApiMapper } from '../../../alerts/api/mappers/alert.mappers';
import { StockApiMapper } from '../../../stock/api/mappers/stock.mappers';
import { ConfirmationApiMapper } from '../../../confirmations/api/mappers/confirmation.mappers';

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
      },
      alerts: data.alerts.map((alert) => AlertApiMapper.toResponse(alert)),
      stock: data.stock.map((item) => StockApiMapper.toItemResponse(item)),
      demand7d: data.demand7d.map((point) =>
        AlertApiMapper.toDemandResponse(point),
      ),
      recentConfirmations: data.recentConfirmations.map((confirmation) =>
        ConfirmationApiMapper.toRecentConfirmationResponse(confirmation),
      ),
    };
  }
}
