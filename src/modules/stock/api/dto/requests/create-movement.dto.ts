import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import type { MovementType } from '../../../core/domain/entities/stock-movement';
import {
  MOVEMENT_TYPES,
  StockMessage,
} from '../../../core/message/stock.message';

// Entrada do registro de movimentação de estoque.
export class CreateMovementDto {
  @ApiProperty({ format: 'uuid', description: 'Item de estoque movimentado.' })
  @IsUUID()
  stockId: string;

  @ApiProperty({ enum: [...MOVEMENT_TYPES], example: 'entrada' })
  @IsIn(MOVEMENT_TYPES, { message: StockMessage.INVALID_MOVEMENT_TYPE })
  type: MovementType;

  @ApiProperty({ example: 50, description: 'Quantidade movimentada (> 0).' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  quantity: number;

  @ApiPropertyOptional({ example: 'Recebimento do fornecedor' })
  @IsOptional()
  @IsString()
  reason?: string;
}
