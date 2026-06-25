import { ApiProperty } from '@nestjs/swagger';
import {
  MenuDayResponseDto,
  MenuMealResponseDto,
} from '../../../../menu/api/dto/responses/menu-day-response.dto';
import { AlertResponseDto } from '../../../../alerts/api/dto/responses/alert-response.dto';
import { DemandPointResponseDto } from '../../../../alerts/api/dto/responses/demand-point-response.dto';
import { StockItemResponseDto } from '../../../../stock/api/dto/responses/stock-item-response.dto';
import { RecentConfirmationResponseDto } from '../../../../confirmations/api/dto/responses/recent-confirmation-response.dto';
import { DashboardStatsDto } from './dashboard-stats.dto';

// Cardápio do dia + estatísticas agregadas + refeição em curso (donut).
export class DashboardMenuTodayDto {
  @ApiProperty({ type: MenuDayResponseDto })
  day: MenuDayResponseDto;

  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({
    type: MenuMealResponseDto,
    nullable: true,
    description:
      'Refeição acontecendo agora (pelo horário do servidor), ou null.',
  })
  currentMeal: MenuMealResponseDto | null;
}

// Payload do painel administrativo.
export class DashboardResponseDto {
  @ApiProperty({ type: DashboardMenuTodayDto })
  menuToday: DashboardMenuTodayDto;

  @ApiProperty({ type: [AlertResponseDto], description: 'Últimos 6 alertas.' })
  alerts: AlertResponseDto[];

  @ApiProperty({
    example: 3,
    description: 'Total de alertas ativos (não resolvidos).',
  })
  activeAlertsCount: number;

  @ApiProperty({
    type: [StockItemResponseDto],
    description: 'Itens em falta (crítico e baixo).',
  })
  stock: StockItemResponseDto[];

  @ApiProperty({
    example: 2,
    description: 'Total de itens em falta (status != ok).',
  })
  shortageItemsCount: number;

  @ApiProperty({
    type: [DemandPointResponseDto],
    description: 'Demanda real (confirmações ativas por dia+período), 7 dias.',
  })
  demand7d: DemandPointResponseDto[];

  @ApiProperty({ type: [RecentConfirmationResponseDto] })
  recentConfirmations: RecentConfirmationResponseDto[];
}
