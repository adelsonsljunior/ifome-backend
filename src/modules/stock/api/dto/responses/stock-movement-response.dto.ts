import { ApiProperty } from '@nestjs/swagger';
import type { MovementType } from '../../../core/domain/entities/stock-movement';

// DTO de saída de uma movimentação de estoque.
export class StockMovementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  stockItemId: string;

  @ApiProperty({ enum: ['entrada', 'saida'], example: 'entrada' })
  type: MovementType;

  @ApiProperty({ example: 50 })
  quantity: number;

  @ApiProperty({ nullable: true, example: 'Recebimento do fornecedor' })
  reason: string | null;

  @ApiProperty({ format: 'uuid', nullable: true, description: 'Admin autor.' })
  createdById: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
