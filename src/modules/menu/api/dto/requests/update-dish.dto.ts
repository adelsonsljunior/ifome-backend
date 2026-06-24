import { ApiPropertyOptional } from '@nestjs/swagger';
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

// Entrada da atualização de prato. Todos os campos são opcionais:
// ausentes não alteram; `restrictions` presente (mesmo vazio) substitui o conjunto.
export class UpdateDishDto {
  @ApiPropertyOptional({
    minLength: MIN_DISH_NAME_LENGTH,
    example: 'Arroz integral',
  })
  @IsOptional()
  @IsString()
  @MinLength(MIN_DISH_NAME_LENGTH, { message: MenuMessage.DISH_NAME_TOO_SHORT })
  name?: string;

  @ApiPropertyOptional({ example: 'Arroz integral soltinho' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ enum: [...DISH_CATEGORIES], example: 'base' })
  @IsOptional()
  @IsIn([...DISH_CATEGORIES], { message: MenuMessage.INVALID_CATEGORY })
  category?: DishCategory;

  @ApiPropertyOptional({
    isArray: true,
    enum: [...DIETARY_TYPES],
    example: ['vegetarian', 'vegan'],
    description: 'Substitui o conjunto de restrições atendidas pelo prato.',
  })
  @IsOptional()
  @IsIn([...DIETARY_TYPES], { each: true })
  @ArrayUnique()
  restrictions?: DietaryType[];
}
