import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { MenuMessage, TIME_REGEX } from '../../../core/message/menu.message';
import { MealDishInputDto } from './meal-dish-input.dto';

// Entrada da atualização de refeição. Campos ausentes não são alterados;
// `dishes` presente substitui o conjunto de pratos da refeição.
export class UpdateMealDto {
  @ApiPropertyOptional({ example: 250, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: MenuMessage.INVALID_CAPACITY })
  capacity?: number;

  @ApiPropertyOptional({
    example: '14:30',
    description: 'Horário final (HH:mm).',
  })
  @IsOptional()
  @Matches(TIME_REGEX, { message: MenuMessage.INVALID_TIME_FORMAT })
  endTime?: string;

  @ApiPropertyOptional({ type: [MealDishInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MealDishInputDto)
  dishes?: MealDishInputDto[];
}
