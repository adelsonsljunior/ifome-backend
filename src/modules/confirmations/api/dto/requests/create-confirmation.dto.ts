import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type {
  ConfirmationType,
  MealPeriod,
} from '../../../core/domain/entities/confirmation';
import {
  CONFIRMATION_TYPES,
  MEAL_PERIODS,
} from '../../../core/message/confirmation.message';

// Entrada da confirmação de presença: período da refeição de hoje + tipo.
export class CreateConfirmationDto {
  @ApiProperty({ enum: [...MEAL_PERIODS], example: 'lunch' })
  @IsIn(MEAL_PERIODS)
  period: MealPeriod;

  @ApiPropertyOptional({
    enum: [...CONFIRMATION_TYPES],
    default: 'standard',
    description: 'padrao (standard) ou adaptada (adapted).',
  })
  @IsOptional()
  @IsIn(CONFIRMATION_TYPES)
  type: ConfirmationType = 'standard';
}
