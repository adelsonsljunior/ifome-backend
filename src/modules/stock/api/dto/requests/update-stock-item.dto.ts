import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { StockMessage } from '../../../core/message/stock.message';

// Entrada da atualização (parcial) de item. `currentQuantity` é intencionalmente
// omitido: toda mudança de quantidade passa pelo ledger de movimentações.
export class UpdateStockItemDto {
  @ApiPropertyOptional({ example: 20, description: 'Quantidade mínima (> 0).' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  minQuantity?: number;

  @ApiPropertyOptional({
    example: 200,
    description: 'Quantidade máxima (> 0).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  maxQuantity?: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;
}
