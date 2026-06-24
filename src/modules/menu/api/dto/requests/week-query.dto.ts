import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { DietaryType } from '../../../core/domain/entities/dish';
import { DIETARY_TYPES } from '../../../core/message/menu.message';

// Query do cardápio da semana: filtro opcional por restrição alimentar.
export class WeekQueryDto {
  @ApiPropertyOptional({
    enum: [...DIETARY_TYPES],
    example: 'vegetarian',
    description: 'Exibe apenas pratos que atendem à restrição informada.',
  })
  @IsOptional()
  @IsIn([...DIETARY_TYPES])
  filter?: DietaryType;
}
