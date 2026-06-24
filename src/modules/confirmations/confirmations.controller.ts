import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CONFIRMATION_USECASES,
  type IConfirmationUseCases,
} from './core/interfaces/primary/confirmation.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { CreateConfirmationDto } from './api/dto/requests/create-confirmation.dto';
import { RecentConfirmationsQueryDto } from './api/dto/requests/recent-confirmations-query.dto';
import { ConfirmationResponseDto } from './api/dto/responses/confirmation-response.dto';
import { RecentConfirmationResponseDto } from './api/dto/responses/recent-confirmation-response.dto';
import { ConfirmationApiMapper } from './api/mappers/confirmation.mappers';

@ApiTags('confirmations')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@Controller('confirmations')
export class ConfirmationsController {
  constructor(
    @Inject(CONFIRMATION_USECASES)
    private readonly confirmationUseCases: IConfirmationUseCases,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Confirma presença na refeição de hoje (aluno)' })
  @ApiCreatedResponse({ type: ConfirmationResponseDto })
  @ApiBadRequestResponse({
    description: 'Período inválido, sem refeição hoje ou prazo encerrado',
  })
  @ApiForbiddenResponse({ description: 'Acesso restrito a alunos' })
  @ApiConflictResponse({ description: 'Capacidade da refeição esgotada' })
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConfirmationDto,
  ): Promise<ConfirmationResponseDto> {
    const confirmation = await this.confirmationUseCases.confirm(user.id, {
      period: dto.period,
      type: dto.type,
    });
    return ConfirmationApiMapper.toConfirmationResponse(confirmation);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Confirmação do aluno para hoje (ou null se não houver)',
  })
  @ApiOkResponse({ type: ConfirmationResponseDto })
  @ApiForbiddenResponse({ description: 'Acesso restrito a alunos' })
  async getToday(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConfirmationResponseDto | null> {
    const confirmation = await this.confirmationUseCases.getToday(user.id);
    return confirmation
      ? ConfirmationApiMapper.toConfirmationResponse(confirmation)
      : null;
  }

  @Delete('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancela a confirmação do aluno para hoje' })
  @ApiNoContentResponse({ description: 'Confirmação cancelada' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a alunos' })
  @ApiNotFoundResponse({ description: 'Sem confirmação para hoje' })
  @ApiConflictResponse({ description: 'Prazo de cancelamento encerrado' })
  async cancelToday(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.confirmationUseCases.cancelToday(user.id);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Lista paginada das confirmações de refeição mais recentes (admin)',
  })
  @ApiPaginatedResponse(RecentConfirmationResponseDto)
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  async getRecent(@Query() query: RecentConfirmationsQueryDto) {
    const result = await this.confirmationUseCases.getRecent(
      query.page,
      query.pageSize,
      query.sort,
    );
    return ConfirmationApiMapper.toRecentConfirmationPage(result);
  }
}
