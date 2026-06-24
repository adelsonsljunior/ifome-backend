import { ApiProperty } from '@nestjs/swagger';
import type {
  DietaryType,
  DishCategory,
} from '../../../core/domain/entities/dish';
import type { MealPeriod } from '../../../core/domain/entities/meal';
import {
  DIETARY_TYPES,
  DISH_CATEGORIES,
  MEAL_PERIODS,
} from '../../../core/message/menu.message';

// Prato exibido no cardápio público (today/week).
export class MenuDishResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Arroz branco' })
  name: string;

  @ApiProperty({ example: 'Arroz branco soltinho' })
  description: string;

  @ApiProperty({ enum: [...DISH_CATEGORIES], example: 'base' })
  category: DishCategory;

  @ApiProperty({
    isArray: true,
    enum: [...DIETARY_TYPES],
    example: ['vegetarian'],
  })
  restrictions: DietaryType[];
}

// Refeição do cardápio público com os números de ocupação.
export class MenuMealResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: [...MEAL_PERIODS], example: 'lunch' })
  period: MealPeriod;

  @ApiProperty({ example: '11:00' })
  startTime: string;

  @ApiProperty({ example: '14:00' })
  endTime: string;

  @ApiProperty({ example: 200, description: 'Capacidade total da refeição.' })
  capacity: number;

  @ApiProperty({ example: 120, description: 'Confirmações ativas.' })
  confirmedCount: number;

  @ApiProperty({ example: 60, description: 'Percentual de ocupação (0–100).' })
  usagePercent: number;

  @ApiProperty({ type: [MenuDishResponseDto] })
  dishes: MenuDishResponseDto[];
}

// DTO de saída do cardápio de um dia (usado por today e por cada dia de week).
export class MenuDayResponseDto {
  @ApiProperty({ format: 'date', example: '2026-06-24' })
  date: string;

  @ApiProperty({ type: [MenuMealResponseDto] })
  meals: MenuMealResponseDto[];
}
