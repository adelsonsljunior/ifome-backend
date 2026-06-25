import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { MealPeriod } from '../../../core/domain/entities/confirmation';
import { MEAL_PERIODS } from '../../../core/message/confirmation.message';

// Entrada do cancelamento: período da refeição de hoje a ser cancelada.
export class CancelConfirmationQueryDto {
  @ApiProperty({ enum: [...MEAL_PERIODS], example: 'lunch' })
  @IsIn(MEAL_PERIODS)
  period: MealPeriod;
}
