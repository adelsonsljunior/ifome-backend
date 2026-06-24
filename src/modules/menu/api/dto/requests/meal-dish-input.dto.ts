import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

// Item da lista de pratos de uma refeição: referência do prato + ordem de exibição.
export class MealDishInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  dishId: string;

  @ApiProperty({ example: 0, minimum: 0, description: 'Ordem de exibição.' })
  @IsInt()
  @Min(0)
  order: number;
}
