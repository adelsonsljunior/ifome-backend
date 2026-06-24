import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  MENU_USECASES,
  type IMenuUseCases,
} from './core/interfaces/primary/menu.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DIETARY_TYPES } from './core/message/menu.message';
import { CreateDishDto } from './api/dto/requests/create-dish.dto';
import { UpdateDishDto } from './api/dto/requests/update-dish.dto';
import { CreateMealDto } from './api/dto/requests/create-meal.dto';
import { UpdateMealDto } from './api/dto/requests/update-meal.dto';
import { WeekQueryDto } from './api/dto/requests/week-query.dto';
import { DishResponseDto } from './api/dto/responses/dish-response.dto';
import { MealResponseDto } from './api/dto/responses/meal-response.dto';
import { MenuDayResponseDto } from './api/dto/responses/menu-day-response.dto';
import { MenuApiMapper } from './api/mappers/menu.mappers';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(
    @Inject(MENU_USECASES)
    private readonly menuUseCases: IMenuUseCases,
  ) {}

  @Get('today')
  @ApiOperation({ summary: 'Cardápio do dia (público)' })
  @ApiOkResponse({ type: MenuDayResponseDto })
  async getToday(): Promise<MenuDayResponseDto> {
    const day = await this.menuUseCases.getToday();
    return MenuApiMapper.toMenuDayResponse(day);
  }

  @Get('week')
  @ApiOperation({
    summary: 'Cardápio dos próximos 7 dias (público), com filtro opcional',
  })
  @ApiQuery({ name: 'filter', required: false, enum: [...DIETARY_TYPES] })
  @ApiOkResponse({ type: MenuDayResponseDto, isArray: true })
  async getWeek(@Query() query: WeekQueryDto): Promise<MenuDayResponseDto[]> {
    const days = await this.menuUseCases.getWeek(query.filter);
    return days.map((day) => MenuApiMapper.toMenuDayResponse(day));
  }

  @Get('dishes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes de um prato' })
  @ApiOkResponse({ type: DishResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Prato não encontrado' })
  async getDish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DishResponseDto> {
    const dish = await this.menuUseCases.getDishById(id);
    return MenuApiMapper.toDishResponse(dish);
  }

  @Post('dishes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um prato no catálogo (admin)' })
  @ApiCreatedResponse({ type: DishResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  async createDish(@Body() dto: CreateDishDto): Promise<DishResponseDto> {
    const dish = await this.menuUseCases.createDish({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      restrictions: dto.restrictions ?? [],
    });
    return MenuApiMapper.toDishResponse(dish);
  }

  @Put('dishes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza um prato do catálogo (admin)' })
  @ApiNoContentResponse({ description: 'Prato atualizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  @ApiNotFoundResponse({ description: 'Prato não encontrado' })
  async updateDish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishDto,
  ): Promise<void> {
    await this.menuUseCases.updateDish(id, {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      restrictions: dto.restrictions,
    });
  }

  @Delete('dishes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um prato do catálogo (admin)' })
  @ApiNoContentResponse({ description: 'Prato removido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  @ApiNotFoundResponse({ description: 'Prato não encontrado' })
  @ApiConflictResponse({
    description: 'Prato em uso por uma refeição agendada',
  })
  async deleteDish(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.menuUseCases.deleteDish(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agenda uma refeição (admin)' })
  @ApiCreatedResponse({ type: MealResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou data não futura' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  @ApiConflictResponse({
    description: 'Já existe refeição para esta data e período',
  })
  async createMeal(@Body() dto: CreateMealDto): Promise<MealResponseDto> {
    const meal = await this.menuUseCases.createMeal({
      date: dto.date,
      period: dto.period,
      startTime: dto.startTime,
      endTime: dto.endTime,
      capacity: dto.capacity,
      dishes: dto.dishes,
    });
    return MenuApiMapper.toMealResponse(meal);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza uma refeição agendada (admin)' })
  @ApiNoContentResponse({ description: 'Refeição atualizada' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
  @ApiNotFoundResponse({ description: 'Refeição não encontrada' })
  async updateMeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMealDto,
  ): Promise<void> {
    await this.menuUseCases.updateMeal(id, {
      capacity: dto.capacity,
      endTime: dto.endTime,
      dishes: dto.dishes,
    });
  }
}
