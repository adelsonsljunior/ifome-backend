import { ApiProperty } from '@nestjs/swagger';
import { MenuDayResponseDto } from '../../../../menu/api/dto/responses/menu-day-response.dto';
import { AlertResponseDto } from '../../../../alerts/api/dto/responses/alert-response.dto';
import { DemandPointResponseDto } from '../../../../alerts/api/dto/responses/demand-point-response.dto';
import { StockItemResponseDto } from '../../../../stock/api/dto/responses/stock-item-response.dto';
import { RecentConfirmationResponseDto } from '../../../../confirmations/api/dto/responses/recent-confirmation-response.dto';
import { DashboardStatsDto } from './dashboard-stats.dto';

// Cardápio do dia + estatísticas agregadas.
export class DashboardMenuTodayDto {
  @ApiProperty({ type: MenuDayResponseDto })
  day: MenuDayResponseDto;

  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;
}

// Payload do painel administrativo.
export class DashboardResponseDto {
  @ApiProperty({ type: DashboardMenuTodayDto })
  menuToday: DashboardMenuTodayDto;

  @ApiProperty({ type: [AlertResponseDto], description: 'Últimos 6 alertas.' })
  alerts: AlertResponseDto[];

  @ApiProperty({
    type: [StockItemResponseDto],
    description: 'Itens em falta (crítico e baixo).',
  })
  stock: StockItemResponseDto[];

  @ApiProperty({
    type: [DemandPointResponseDto],
    description: 'Demanda dos últimos 7 dias.',
  })
  demand7d: DemandPointResponseDto[];

  @ApiProperty({ type: [RecentConfirmationResponseDto] })
  recentConfirmations: RecentConfirmationResponseDto[];
}
