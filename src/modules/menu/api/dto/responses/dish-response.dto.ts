import { ApiProperty } from '@nestjs/swagger';
import type {
  DietaryType,
  DishCategory,
} from '../../../core/domain/entities/dish';
import {
  DIETARY_TYPES,
  DISH_CATEGORIES,
} from '../../../core/message/menu.message';

// DTO de saída de um prato do catálogo.
export class DishResponseDto {
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

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
