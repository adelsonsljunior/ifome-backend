import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import type { MealPeriod } from '../../../core/domain/entities/meal';
import {
  MEAL_PERIODS,
  MenuMessage,
  TIME_REGEX,
} from '../../../core/message/menu.message';
import { MealDishInputDto } from './meal-dish-input.dto';

// Entrada do agendamento de refeição.
export class CreateMealDto {
  @ApiProperty({ format: 'date', example: '2026-06-30' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: [...MEAL_PERIODS], example: 'lunch' })
  @IsIn([...MEAL_PERIODS], { message: MenuMessage.INVALID_PERIOD })
  period: MealPeriod;

  @ApiProperty({ example: '11:00', description: 'Horário inicial (HH:mm).' })
  @Matches(TIME_REGEX, { message: MenuMessage.INVALID_TIME_FORMAT })
  startTime: string;

  @ApiProperty({ example: '14:00', description: 'Horário final (HH:mm).' })
  @Matches(TIME_REGEX, { message: MenuMessage.INVALID_TIME_FORMAT })
  endTime: string;

  @ApiProperty({ example: 200, minimum: 1 })
  @IsInt()
  @Min(1, { message: MenuMessage.INVALID_CAPACITY })
  capacity: number;

  @ApiProperty({ type: [MealDishInputDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MealDishInputDto)
  dishes: MealDishInputDto[];
}
