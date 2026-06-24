import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  USERS_USECASES,
  type IUsersUseCases,
} from './core/interfaces/primary/user.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginationQueryDto } from '../../common/dto/requests/pagination-query.dto';
import { UpdateProfileDto } from './api/dto/requests/update-profile.dto';
import { RecentConfirmationsQueryDto } from './api/dto/requests/recent-confirmations-query.dto';
import { UserProfileResponseDto } from './api/dto/responses/user-profile-response.dto';
import { MealHistoryResponseDto } from './api/dto/responses/meal-history-response.dto';
import { RecentConfirmationResponseDto } from './api/dto/responses/recent-confirmation-response.dto';
import { UserApiMapper } from './api/mappers/user.mappers';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(USERS_USECASES)
    private readonly usersUseCases: IUsersUseCases,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    this.logger.log(`Fetching profile for user ${user.id}`);
    const profile = await this.usersUseCases.getProfile(user.id);
    return UserApiMapper.toProfileResponse(profile);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza telefone e/ou restrições do usuário' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    this.logger.log(`Updating profile for user ${user.id}`);
    const profile = await this.usersUseCases.updateProfile(user.id, {
      phone: dto.phone,
      restrictions: dto.restrictions,
    });
    return UserApiMapper.toProfileResponse(profile);
  }

  @Get('meal-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Lista paginada do histórico de refeições do aluno',
  })
  @ApiPaginatedResponse(MealHistoryResponseDto)
  @ApiForbiddenResponse({ description: 'Acesso restrito a alunos' })
  async getMealHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    this.logger.log(
      `Fetching meal history for user ${user.id} (page ${query.page})`,
    );
    const result = await this.usersUseCases.getMealHistory(
      user.id,
      query.page,
      query.pageSize,
    );
    return UserApiMapper.toMealHistoryPage(result);
  }

  @Get('recent-confirmations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Lista as confirmações de refeição mais recentes (admin)',
  })
  @ApiOkResponse({ type: RecentConfirmationResponseDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  async getRecentConfirmations(
    @Query() query: RecentConfirmationsQueryDto,
  ): Promise<RecentConfirmationResponseDto[]> {
    this.logger.log(`Fetching ${query.limit} recent confirmations`);
    const confirmations = await this.usersUseCases.getRecentConfirmations(
      query.limit,
      query.ordenar_por,
    );
    return confirmations.map((confirmation) =>
      UserApiMapper.toRecentConfirmationResponse(confirmation),
    );
  }
}
