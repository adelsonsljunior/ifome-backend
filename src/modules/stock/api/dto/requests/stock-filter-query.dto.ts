import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/requests/pagination-query.dto';
import type { StockFilter } from '../../../core/interfaces/primary/stock.use-cases.interface';

const FILTERS: StockFilter[] = ['ok', 'low', 'crit', 'all'];

// Query paginada da listagem de itens: filtra por status ou 'all' (page/pageSize herdados).
export class StockFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: FILTERS,
    default: 'all',
    description: 'Filtra os itens por status de criticidade.',
  })
  @IsOptional()
  @IsIn(FILTERS)
  filter: StockFilter = 'all';
}
