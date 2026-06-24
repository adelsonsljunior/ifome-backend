import { ApiProperty } from '@nestjs/swagger';
import type {
  ConfirmationType,
  MealPeriod,
} from '../../../core/domain/entities/confirmation';

// DTO de saída de uma confirmação do aluno (rotas /today e POST).
export class ConfirmationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mealId: string;

  @ApiProperty({ format: 'date', example: '2026-06-24' })
  date: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner'], example: 'lunch' })
  period: MealPeriod;

  @ApiProperty({ enum: ['standard', 'adapted'], example: 'standard' })
  type: ConfirmationType;

  @ApiProperty({ format: 'date-time' })
  confirmedAt: string;
}
