import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  DASHBOARD_USECASES,
  type IDashboardUseCases,
} from './core/interfaces/primary/dashboard.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardResponseDto } from './api/dto/responses/dashboard-response.dto';
import { DashboardApiMapper } from './api/mappers/dashboard.mappers';

@ApiTags('dashboard')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(DASHBOARD_USECASES)
    private readonly dashboardUseCases: IDashboardUseCases,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Painel administrativo agregado (admin)' })
  @ApiOkResponse({ type: DashboardResponseDto })
  async get(): Promise<DashboardResponseDto> {
    const data = await this.dashboardUseCases.getDashboard();
    return DashboardApiMapper.toResponse(data);
  }
}
