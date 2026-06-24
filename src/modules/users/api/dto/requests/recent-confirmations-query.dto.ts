import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { RecentConfirmationsOrder } from '../../../core/interfaces/primary/user.use-cases.interface';

export const DEFAULT_RECENT_LIMIT = 6;
export const MAX_RECENT_LIMIT = 50;
const ORDERS: RecentConfirmationsOrder[] = ['recente'];

// Query do painel admin de confirmações recentes (top-N, não paginação completa).
// `ordenar_por` mantém o snake_case do contrato externo (?ordenar_por=recente)
// para casar com o ValidationPipe (whitelist + forbidNonWhitelisted).
export class RecentConfirmationsQueryDto {
  @ApiPropertyOptional({
    example: 6,
    minimum: 1,
    maximum: MAX_RECENT_LIMIT,
    default: DEFAULT_RECENT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_RECENT_LIMIT)
  limit: number = DEFAULT_RECENT_LIMIT;

  @ApiPropertyOptional({
    enum: ORDERS,
    default: 'recente',
    description: 'Ordenação. Atualmente só "recente" (mais novas primeiro).',
  })
  @IsOptional()
  @IsIn(ORDERS)
  ordenar_por: RecentConfirmationsOrder = 'recente';
}
