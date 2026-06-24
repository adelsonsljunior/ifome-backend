import { ApiProperty } from '@nestjs/swagger';

// Estatísticas agregadas do cardápio do dia.
export class DashboardStatsDto {
  @ApiProperty({ example: 2, description: 'Refeições agendadas hoje.' })
  mealsCount: number;

  @ApiProperty({ example: 400, description: 'Capacidade total do dia.' })
  totalCapacity: number;

  @ApiProperty({
    example: 240,
    description: 'Confirmações ativas do dia (ignora canceladas).',
  })
  totalConfirmed: number;

  @ApiProperty({ example: 60, description: 'Ocupação do dia (0–100).' })
  occupancyPercent: number;
}
