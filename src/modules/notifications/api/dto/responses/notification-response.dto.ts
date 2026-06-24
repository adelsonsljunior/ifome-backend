import { ApiProperty } from '@nestjs/swagger';
import type { NotificationIcon } from '../../../core/domain/entities/notification';

// DTO de saída de uma notificação do usuário.
export class NotificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({
    enum: ['utensils', 'alert', 'bell', 'checkCircle', 'calendar'],
    example: 'utensils',
  })
  icon: NotificationIcon;

  @ApiProperty({ example: 'Cardápio de hoje disponível' })
  title: string;

  @ApiProperty({ example: 'Confira o almoço de hoje no RU.' })
  body: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiProperty({ format: 'date-time', nullable: true })
  readAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
