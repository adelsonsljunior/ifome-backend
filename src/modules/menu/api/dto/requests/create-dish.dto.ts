import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type {
  DietaryType,
  DishCategory,
} from '../../../core/domain/entities/dish';
import {
  DIETARY_TYPES,
  DISH_CATEGORIES,
  MenuMessage,
  MIN_DISH_NAME_LENGTH,
} from '../../../core/message/menu.message';

// Entrada da criação de prato.
export class CreateDishDto {
  @ApiProperty({ minLength: MIN_DISH_NAME_LENGTH, example: 'Arroz branco' })
  @IsString()
  @MinLength(MIN_DISH_NAME_LENGTH, { message: MenuMessage.DISH_NAME_TOO_SHORT })
  name: string;

  @ApiProperty({ example: 'Arroz branco soltinho' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: [...DISH_CATEGORIES], example: 'base' })
  @IsIn([...DISH_CATEGORIES], { message: MenuMessage.INVALID_CATEGORY })
  category: DishCategory;

  @ApiPropertyOptional({
    isArray: true,
    enum: [...DIETARY_TYPES],
    example: ['vegetarian'],
    description: 'Restrições alimentares atendidas pelo prato.',
  })
  @IsOptional()
  @IsIn([...DIETARY_TYPES], { each: true })
  @ArrayUnique()
  restrictions?: DietaryType[];
}
