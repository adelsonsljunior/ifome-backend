import { Inject, Injectable } from '@nestjs/common';
import { User } from './core/domain/entities/user';
import { IUsersUseCases } from './core/interfaces/primary/user.use-cases.interface';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from './core/interfaces/secondary/user.repository.interface';

@Injectable()
export class UsersService implements IUsersUseCases {
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
}
