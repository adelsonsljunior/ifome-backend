import { ApiProperty } from '@nestjs/swagger';
import type { MealPeriod } from '../../../core/domain/entities/meal';
import { MEAL_PERIODS } from '../../../core/message/menu.message';

// Item da lista de pratos de uma refeição (referência + ordem).
export class MealDishResponseDto {
  @ApiProperty({ format: 'uuid' })
  dishId: string;

  @ApiProperty({ example: 0 })
  order: number;
}

// DTO de saída de uma refeição agendada (resultado de criação/atualização).
export class MealResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date', example: '2026-06-30' })
  date: string;

  @ApiProperty({ enum: [...MEAL_PERIODS], example: 'lunch' })
  period: MealPeriod;

  @ApiProperty({ example: '11:00' })
  startTime: string;

  @ApiProperty({ example: '14:00' })
  endTime: string;

  @ApiProperty({ example: 200 })
  capacity: number;

  @ApiProperty({ type: [MealDishResponseDto] })
  dishes: MealDishResponseDto[];
}
