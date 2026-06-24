import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/requests/pagination-query.dto';
import type { RecentConfirmationsOrder } from '../../../core/interfaces/primary/confirmation.use-cases.interface';

const SORT_OPTIONS: RecentConfirmationsOrder[] = ['newest', 'oldest'];

// Query paginada do painel admin de confirmações recentes (page/pageSize herdados).
export class RecentConfirmationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: SORT_OPTIONS,
    default: 'newest',
    description:
      'Ordenação por data da confirmação: "newest" (mais recentes) ou "oldest" (mais antigas).',
  })
  @IsOptional()
  @IsIn(SORT_OPTIONS)
  sort: RecentConfirmationsOrder = 'newest';
}
