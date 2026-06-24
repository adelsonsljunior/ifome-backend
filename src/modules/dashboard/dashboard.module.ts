import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DASHBOARD_USECASES } from './core/interfaces/primary/dashboard.use-cases.interface';
import { MenuModule } from '../menu/menu.module';
import { AlertsModule } from '../alerts/alerts.module';
import { StockModule } from '../stock/stock.module';
import { ConfirmationsModule } from '../confirmations/confirmations.module';

@Module({
  imports: [MenuModule, AlertsModule, StockModule, ConfirmationsModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    { provide: DASHBOARD_USECASES, useExisting: DashboardService },
  ],
})
export class DashboardModule {}
