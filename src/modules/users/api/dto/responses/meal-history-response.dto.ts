import { ApiProperty } from '@nestjs/swagger';
import type { MealPeriod } from '../../../core/domain/entities/meal-history';

// DTO de saída de um registro do histórico de refeições.
export class MealHistoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date', example: '2026-06-20' })
  date: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner'], example: 'lunch' })
  period: MealPeriod;

  @ApiProperty({ example: 'Arroz, feijão e bife' })
  dish: string;

  @ApiProperty({
    nullable: true,
    example: 5,
    description: 'Avaliação de 1 a 5.',
  })
  rating: number | null;

  @ApiProperty({ format: 'date-time' })
  recordedAt: string;
}
