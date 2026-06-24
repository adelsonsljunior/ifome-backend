import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './core/domain/entities/user';
import { MealHistory } from './core/domain/entities/meal-history';
import { PaginationReadModel } from '../../shared/domain/read-models/pagination/pagination.read-model';
import {
  IUsersUseCases,
  UpdateProfileData,
} from './core/interfaces/primary/user.use-cases.interface';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from './core/interfaces/secondary/user.repository.interface';
import { UserMessage } from './core/message/user.message';

@Injectable()
export class UsersService implements IUsersUseCases {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getProfile(userId: string): Promise<User> {
    this.logger.log(`Getting profile for user ${userId}`);
    const user = await this.userRepository.findProfileById(userId);
    if (!user) {
      this.logger.warn(`Profile not found for user ${userId}`);
      throw new NotFoundException(UserMessage.NOT_FOUND);
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    this.logger.log(`Updating profile for user ${userId}`);
    const user = await this.userRepository.updateProfile(userId, data);
    if (!user) {
      this.logger.warn(`Profile not found for user ${userId}`);
      throw new NotFoundException(UserMessage.NOT_FOUND);
    }
    return user;
  }

  async getMealHistory(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<MealHistory>> {
    this.logger.log(`Getting meal history for user ${userId} (page ${page})`);
    const skip = (page - 1) * pageSize;
    const { rows, total } = await this.userRepository.findMealHistoryPage(
      userId,
      skip,
      pageSize,
    );
    return PaginationReadModel.create(rows, page, pageSize, total);
  }
}
