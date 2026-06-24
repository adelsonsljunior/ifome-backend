import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  NOTIFICATION_USECASES,
  type INotificationUseCases,
} from './core/interfaces/primary/notification.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginationQueryDto } from '../../common/dto/requests/pagination-query.dto';
import { CountResponseDto } from '../../common/dto/responses/count-response.dto';
import { NotificationResponseDto } from './api/dto/responses/notification-response.dto';
import { NotificationApiMapper } from './api/mappers/notification.mappers';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Acesso restrito a alunos' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NOTIFICATION_USECASES)
    private readonly notificationUseCases: INotificationUseCases,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada das notificações do usuário' })
  @ApiPaginatedResponse(NotificationResponseDto)
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    const result = await this.notificationUseCases.listForUser(
      user.id,
      query.page,
      query.pageSize,
    );
    return NotificationApiMapper.toPage(result);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Quantidade de notificações não lidas do usuário' })
  @ApiOkResponse({ type: CountResponseDto })
  async unreadCount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CountResponseDto> {
    const count = await this.notificationUseCases.unreadCount(user.id);
    return new CountResponseDto(count);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marca todas as notificações do usuário como lidas',
  })
  @ApiNoContentResponse({ description: 'Notificações marcadas como lidas' })
  async markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.notificationUseCases.markAllRead(user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marca uma notificação do usuário como lida' })
  @ApiNoContentResponse({ description: 'Notificação marcada como lida' })
  @ApiNotFoundResponse({ description: 'Notificação não encontrada' })
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notificationUseCases.markRead(user.id, id);
  }
}
