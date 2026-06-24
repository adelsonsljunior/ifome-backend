import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { ALERT_USECASES } from './core/interfaces/primary/alert.use-cases.interface';
import { ALERT_ENGINE } from './core/interfaces/primary/alert-engine.interface';
import { ALERT_REPOSITORY } from './core/interfaces/secondary/alert.repository.interface';
import { AlertRepository } from './infra/database/repository/alert.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AlertsController],
  providers: [
    AlertsService,
    { provide: ALERT_USECASES, useExisting: AlertsService },
    { provide: ALERT_ENGINE, useExisting: AlertsService },
    AlertRepository,
    { provide: ALERT_REPOSITORY, useExisting: AlertRepository },
  ],
  exports: [ALERT_USECASES, ALERT_ENGINE],
})
export class AlertsModule {}
