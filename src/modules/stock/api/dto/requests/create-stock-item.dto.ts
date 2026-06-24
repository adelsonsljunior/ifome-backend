import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import {
  MIN_ITEM_NAME_LENGTH,
  StockMessage,
} from '../../../core/message/stock.message';

// Entrada da criação de item de estoque.
export class CreateStockItemDto {
  @ApiProperty({ minLength: MIN_ITEM_NAME_LENGTH, example: 'Arroz' })
  @IsString()
  @MinLength(MIN_ITEM_NAME_LENGTH, { message: StockMessage.NAME_TOO_SHORT })
  name: string;

  @ApiProperty({ example: 'Grains' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 100, description: 'Quantidade atual (> 0).' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  currentQuantity: number;

  @ApiProperty({ example: 20, description: 'Quantidade mínima (> 0).' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  minQuantity: number;

  @ApiProperty({ example: 200, description: 'Quantidade máxima (> 0).' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: StockMessage.INVALID_QUANTITY })
  maxQuantity: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
