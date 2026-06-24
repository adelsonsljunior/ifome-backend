import { ApiProperty } from '@nestjs/swagger';
import type {
  AlertLevel,
  AlertType,
} from '../../../core/domain/entities/alert';

// DTO de saída de um alerta.
export class AlertResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['crit', 'warn', 'info'], example: 'crit' })
  level: AlertLevel;

  @ApiProperty({
    enum: ['criticalStock', 'lowStock', 'confirmationsPeak', 'other'],
    example: 'criticalStock',
  })
  type: AlertType;

  @ApiProperty({ example: 'Estoque crítico: Arroz' })
  title: string;

  @ApiProperty({ example: 'O item "Arroz" está abaixo de 30% do mínimo.' })
  body: string;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'Entidade de origem.',
  })
  relatedId: string | null;

  @ApiProperty({ example: false, description: 'true se já resolvido.' })
  resolved: boolean;

  @ApiProperty({ format: 'date-time', nullable: true })
  resolvedAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
