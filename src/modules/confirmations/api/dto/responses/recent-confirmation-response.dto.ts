import { ApiProperty } from '@nestjs/swagger';
import type {
  ConfirmationType,
  MealPeriod,
} from '../../../core/domain/entities/confirmation';

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
