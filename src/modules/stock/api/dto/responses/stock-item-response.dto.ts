import { ApiProperty } from '@nestjs/swagger';
import type { StockStatus } from '../../../core/domain/entities/stock-item';

// DTO de saída de um item de estoque.
export class StockItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Arroz' })
  name: string;

  @ApiProperty({ example: 'Grains' })
  category: string;

  @ApiProperty({ example: 100 })
  currentQuantity: number;

  @ApiProperty({ example: 20 })
  minQuantity: number;

  @ApiProperty({ example: 200 })
  maxQuantity: number;

  @ApiProperty({ example: 'kg' })
  unit: string;

  @ApiProperty({ enum: ['ok', 'low', 'crit'], example: 'ok' })
  status: StockStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
