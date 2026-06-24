import { ApiProperty } from '@nestjs/swagger';
import type { MealPeriod } from '../../../core/domain/entities/meal-history';
import type { ConfirmationType } from '../../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';

// DTO de saída de uma confirmação recente (painel admin).
export class RecentConfirmationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'Aluno Teste' })
  userName: string;

  @ApiProperty({ example: 'ALU0001' })
  userEnrollment: string;

  @ApiProperty({ format: 'date', example: '2026-06-24' })
  mealDate: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner'], example: 'lunch' })
  mealPeriod: MealPeriod;

  @ApiProperty({ enum: ['standard', 'adapted'], example: 'standard' })
  type: ConfirmationType;

  @ApiProperty({ format: 'date-time' })
  confirmedAt: string;
}
