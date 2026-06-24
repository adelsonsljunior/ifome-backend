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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
  STOCK_USECASES,
  type IStockUseCases,
} from './core/interfaces/primary/stock.use-cases.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { CreateStockItemDto } from './api/dto/requests/create-stock-item.dto';
import { UpdateStockItemDto } from './api/dto/requests/update-stock-item.dto';
import { CreateMovementDto } from './api/dto/requests/create-movement.dto';
import { StockFilterQueryDto } from './api/dto/requests/stock-filter-query.dto';
import { MovementsQueryDto } from './api/dto/requests/movements-query.dto';
import { StockItemResponseDto } from './api/dto/responses/stock-item-response.dto';
import { StockMovementResponseDto } from './api/dto/responses/stock-movement-response.dto';
import { StockApiMapper } from './api/mappers/stock.mappers';

@ApiTags('stock')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Acesso restrito a administradores' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('stock')
export class StockController {
  constructor(
    @Inject(STOCK_USECASES)
    private readonly stockUseCases: IStockUseCases,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Lista paginada de itens de estoque, com filtro por status (admin)',
  })
  @ApiPaginatedResponse(StockItemResponseDto)
  async list(@Query() query: StockFilterQueryDto) {
    const result = await this.stockUseCases.listItems(
      query.filter,
      query.page,
      query.pageSize,
    );
    return StockApiMapper.toItemPage(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um item de estoque (admin)' })
  @ApiCreatedResponse({ type: StockItemResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async create(@Body() dto: CreateStockItemDto): Promise<StockItemResponseDto> {
    const item = await this.stockUseCases.createItem({
      name: dto.name,
      category: dto.category,
      currentQuantity: dto.currentQuantity,
      minQuantity: dto.minQuantity,
      maxQuantity: dto.maxQuantity,
      unit: dto.unit,
    });
    return StockApiMapper.toItemResponse(item);
  }

  // Rotas estáticas de movimentações declaradas antes de ':id' para não colidirem.
  @Get('movements')
  @ApiOperation({
    summary:
      'Histórico paginado de movimentações, por item e/ou período (admin)',
  })
  @ApiPaginatedResponse(StockMovementResponseDto)
  async listMovements(@Query() query: MovementsQueryDto) {
    const result = await this.stockUseCases.listMovements(
      {
        stockItemId: query.stockId,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      },
      query.page,
      query.pageSize,
    );
    return StockApiMapper.toMovementPage(result);
  }

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registra uma movimentação e ajusta a quantidade do item (admin)',
  })
  @ApiCreatedResponse({ type: StockMovementResponseDto })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou saldo insuficiente',
  })
  @ApiNotFoundResponse({ description: 'Item de estoque não encontrado' })
  async registerMovement(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMovementDto,
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockUseCases.registerMovement(
      {
        stockItemId: dto.stockId,
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason,
      },
      user.id,
    );
    return StockApiMapper.toMovementResponse(movement);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um item de estoque (admin)' })
  @ApiOkResponse({ type: StockItemResponseDto })
  @ApiNotFoundResponse({ description: 'Item de estoque não encontrado' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StockItemResponseDto> {
    const item = await this.stockUseCases.getItem(id);
    return StockApiMapper.toItemResponse(item);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza limites/unidade de um item (admin)' })
  @ApiNoContentResponse({ description: 'Item atualizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Item de estoque não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockItemDto,
  ): Promise<void> {
    await this.stockUseCases.updateItem(id, {
      minQuantity: dto.minQuantity,
      maxQuantity: dto.maxQuantity,
      unit: dto.unit,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um item de estoque (admin)' })
  @ApiNoContentResponse({ description: 'Item removido' })
  @ApiNotFoundResponse({ description: 'Item de estoque não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.stockUseCases.deleteItem(id);
  }
}
