import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ConfirmationBuilder,
  MealPeriod,
} from './core/domain/entities/confirmation';
import { ConfirmationReadModel } from './core/domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from './core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import {
  ConfirmData,
  IConfirmationUseCases,
  RecentConfirmationsOrder,
} from './core/interfaces/primary/confirmation.use-cases.interface';
import {
  CONFIRMATION_REPOSITORY,
  MealForConfirmation,
  type IConfirmationRepository,
} from './core/interfaces/secondary/confirmation.repository.interface';
import { ConfirmationMessage } from './core/message/confirmation.message';

@Injectable()
export class ConfirmationsService implements IConfirmationUseCases {
  private readonly logger = new Logger(ConfirmationsService.name);

  constructor(
    @Inject(CONFIRMATION_REPOSITORY)
    private readonly confirmationRepository: IConfirmationRepository,
  ) {}

  async getToday(userId: string): Promise<ConfirmationReadModel | null> {
    return this.confirmationRepository.findByUserAndDate(
      userId,
      this.todayUtc(),
    );
  }

  async confirm(
    userId: string,
    data: ConfirmData,
  ): Promise<ConfirmationReadModel> {
    const today = this.todayUtc();
    const meal = await this.confirmationRepository.findMealByDateAndPeriod(
      today,
      data.period,
    );
    if (!meal) {
      this.logger.warn(
        `No meal scheduled today for period ${data.period} (user ${userId})`,
      );
      throw new BadRequestException(ConfirmationMessage.MEAL_NOT_FOUND);
    }

    if (this.deadlinePassed(meal)) {
      this.logger.warn(`Deadline passed for meal ${meal.id} (user ${userId})`);
      throw new BadRequestException(ConfirmationMessage.DEADLINE_PASSED);
    }

    // Capacidade: confirmações de outros alunos não podem ter esgotado a vaga.
    const taken = await this.confirmationRepository.countByMeal(
      meal.id,
      userId,
    );
    if (taken >= meal.capacity) {
      this.logger.warn(
        `Capacity exhausted for meal ${meal.id} (user ${userId})`,
      );
      throw new ConflictException(ConfirmationMessage.CAPACITY_EXHAUSTED);
    }

    const confirmation = new ConfirmationBuilder()
      .withUserId(userId)
      .withMealId(meal.id)
      .withType(data.type)
      .build();

    return this.confirmationRepository.upsert(confirmation);
  }

  async cancelToday(userId: string, period: MealPeriod): Promise<void> {
    const today = this.todayUtc();
    // Sem refeição neste período hoje não há confirmação possível para cancelar.
    const meal = await this.confirmationRepository.findMealByDateAndPeriod(
      today,
      period,
    );
    if (!meal) {
      this.logger.warn(
        `No meal today for period ${period}, nothing to cancel (user ${userId})`,
      );
      throw new NotFoundException(ConfirmationMessage.NO_CONFIRMATION_TODAY);
    }

    const confirmation = await this.confirmationRepository.findByUserAndMeal(
      userId,
      meal.id,
    );
    if (!confirmation) {
      this.logger.warn(
        `No confirmation for meal ${meal.id} to cancel (user ${userId})`,
      );
      throw new NotFoundException(ConfirmationMessage.NO_CONFIRMATION_TODAY);
    }

    if (this.deadlinePassed(meal)) {
      this.logger.warn(
        `Deadline passed, cannot cancel confirmation ${confirmation.id} (user ${userId})`,
      );
      throw new ConflictException(ConfirmationMessage.DEADLINE_PASSED);
    }

    await this.confirmationRepository.deleteById(confirmation.id);
  }

  async getRecent(
    page: number,
    pageSize: number,
    order: RecentConfirmationsOrder,
  ): Promise<PaginationReadModel<RecentConfirmationReadModel>> {
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.confirmationRepository.findRecent(
      skip,
      pageSize,
      order,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }

  // Verdadeiro se o horário final da refeição (em UTC) já passou.
  private deadlinePassed(meal: MealForConfirmation): boolean {
    const [hours, minutes] = meal.endTime.split(':').map(Number);
    const deadline = new Date(
      Date.UTC(
        meal.date.getUTCFullYear(),
        meal.date.getUTCMonth(),
        meal.date.getUTCDate(),
        hours,
        minutes,
      ),
    );
    return new Date() > deadline;
  }

  // Data de hoje em meia-noite UTC (a coluna do banco é @db.Date).
  private todayUtc(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
}
