import {
  Body,
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
  ApiBadRequestResponse,
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
  ALERT_USECASES,
  type IAlertUseCases,
} from './core/interfaces/primary/alert.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginationQueryDto } from '../../common/dto/requests/pagination-query.dto';
import { CountResponseDto } from '../../common/dto/responses/count-response.dto';
import { AlertsFilterQueryDto } from './api/dto/requests/alerts-filter-query.dto';
import { UpdateAlertDto } from './api/dto/requests/update-alert.dto';
import { AlertResponseDto } from './api/dto/responses/alert-response.dto';
import { DemandPointResponseDto } from './api/dto/responses/demand-point-response.dto';
import { AlertApiMapper } from './api/mappers/alert.mappers';

@ApiTags('alerts')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('alerts')
export class AlertsController {
  constructor(
    @Inject(ALERT_USECASES)
    private readonly alertUseCases: IAlertUseCases,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de alertas, com filtro (admin)' })
  @ApiPaginatedResponse(AlertResponseDto)
  async list(@Query() query: AlertsFilterQueryDto) {
    const result = await this.alertUseCases.listAlerts(
      query.filter,
      query.page,
      query.pageSize,
    );
    return AlertApiMapper.toPage(result);
  }

  @Get('unresolved-count')
  @ApiOperation({ summary: 'Quantidade de alertas não resolvidos (admin)' })
  @ApiOkResponse({ type: CountResponseDto })
  async unresolvedCount(): Promise<CountResponseDto> {
    const count = await this.alertUseCases.unresolvedCount();
    return new CountResponseDto(count);
  }

  @Get('demand-7days')
  @ApiOperation({ summary: 'Demanda paginada dos últimos 7 dias (admin)' })
  @ApiPaginatedResponse(DemandPointResponseDto)
  async demand7Days(@Query() query: PaginationQueryDto) {
    const result = await this.alertUseCases.getDemand7Days(
      query.page,
      query.pageSize,
    );
    return AlertApiMapper.toDemandPage(result);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Resolve ou reabre um alerta (admin)' })
  @ApiNoContentResponse({ description: 'Alerta atualizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Alerta não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlertDto,
  ): Promise<void> {
    await this.alertUseCases.resolveAlert(id, dto.resolved ?? true);
  }
}
