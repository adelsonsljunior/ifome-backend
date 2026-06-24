import { Module } from '@nestjs/common';
import { ConfirmationsService } from './confirmations.service';
import { ConfirmationsController } from './confirmations.controller';
import { CONFIRMATION_USECASES } from './core/interfaces/primary/confirmation.use-cases.interface';
import { CONFIRMATION_REPOSITORY } from './core/interfaces/secondary/confirmation.repository.interface';
import { ConfirmationRepository } from './infra/database/repository/confirmation.repository';

@Module({
  controllers: [ConfirmationsController],
  providers: [
    ConfirmationsService,
    { provide: CONFIRMATION_USECASES, useExisting: ConfirmationsService },
    ConfirmationRepository,
    { provide: CONFIRMATION_REPOSITORY, useExisting: ConfirmationRepository },
  ],
  exports: [CONFIRMATION_USECASES, CONFIRMATION_REPOSITORY],
})
export class ConfirmationsModule {}
