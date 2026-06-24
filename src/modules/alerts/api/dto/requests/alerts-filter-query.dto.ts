import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/requests/pagination-query.dto';
import type { AlertFilter } from '../../../core/interfaces/primary/alert.use-cases.interface';

const FILTERS: AlertFilter[] = ['crit', 'warn', 'info', 'resolvidos', 'all'];

// Query paginada da listagem de alertas (page/pageSize herdados).
export class AlertsFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: FILTERS,
    default: 'all',
    description:
      'Filtra por nível (crit/warn/info), apenas resolvidos, ou todos (all).',
  })
  @IsOptional()
  @IsIn(FILTERS)
  filter: AlertFilter = 'all';
}
