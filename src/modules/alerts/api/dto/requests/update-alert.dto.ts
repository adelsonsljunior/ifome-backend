import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

// Entrada da atualização de alerta: resolver (true) ou reabrir (false).
// Ausente = resolver (default).
export class UpdateAlertDto {
  @ApiPropertyOptional({
    default: true,
    description: 'true resolve o alerta; false reabre. Ausente = resolve.',
  })
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
