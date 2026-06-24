import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/requests/pagination-query.dto';

// Query paginada do histórico de movimentações: filtra por item e/ou período (page/pageSize herdados).
export class MovementsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filtra por item.' })
  @IsOptional()
  @IsUUID()
  stockId?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Início do período (inclusivo).',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Fim do período (inclusivo).',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
