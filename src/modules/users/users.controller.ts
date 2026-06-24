import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
import { UserProfileResponseDto } from './api/dto/responses/user-profile-response.dto';
import { MealHistoryResponseDto } from './api/dto/responses/meal-history-response.dto';
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza telefone e/ou restrições do usuário' })
  @ApiNoContentResponse({ description: 'Perfil atualizado' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<void> {
    this.logger.log(`Updating profile for user ${user.id}`);
    await this.usersUseCases.updateProfile(user.id, {
      phone: dto.phone,
      restrictions: dto.restrictions,
    });
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
}
