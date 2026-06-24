import { Notification } from '../../core/domain/entities/notification';
import { PaginationReadModel } from '../../../../shared/domain/read-models/pagination/pagination.read-model';
import { PaginationResponseDto } from '../../../../common/dto/responses/pagination-response.dto';
import { NotificationResponseDto } from '../dto/responses/notification-response.dto';

// Converte entidade de domínio -> DTO da camada de API.
export class NotificationApiMapper {
  static toResponse(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id as string,
      icon: notification.icon,
      title: notification.title,
      body: notification.body,
      read: notification.read,
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
      createdAt: (notification.createdAt as Date).toISOString(),
    };
  }

  static toPage(
    page: PaginationReadModel<Notification>,
  ): PaginationResponseDto<NotificationResponseDto> {
    return new PaginationResponseDto(
      page.data.map((item) => this.toResponse(item)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }
}
