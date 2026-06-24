import { ApiProperty } from '@nestjs/swagger';
import type { DemandPeriod } from '../../../core/domain/read-models/demand-point/demand-point.read-model';

// DTO de saída de um ponto de demanda passada.
export class DemandPointResponseDto {
  @ApiProperty({ format: 'date', example: '2026-06-24' })
  date: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner'], example: 'lunch' })
  period: DemandPeriod;

  @ApiProperty({
    example: 120,
    description: 'Total de confirmações no período.',
  })
  count: number;
}
