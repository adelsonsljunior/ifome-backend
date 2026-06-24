import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { STOCK_USECASES } from './core/interfaces/primary/stock.use-cases.interface';
import { STOCK_REPOSITORY } from './core/interfaces/secondary/stock.repository.interface';
import { StockRepository } from './infra/database/repository/stock.repository';

@Module({
  controllers: [StockController],
  providers: [
    StockService,
    { provide: STOCK_USECASES, useExisting: StockService },
    StockRepository,
    { provide: STOCK_REPOSITORY, useExisting: StockRepository },
  ],
  exports: [STOCK_USECASES, STOCK_REPOSITORY],
})
export class StockModule {}
