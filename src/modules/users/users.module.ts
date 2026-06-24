import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { USERS_USECASES } from './core/interfaces/primary/user.use-cases.interface';
import { USER_REPOSITORY } from './core/interfaces/secondary/user.repository.interface';
import { UserRepository } from './infra/database/repository/user.repository';

@Module({
  providers: [
    UsersService,
    { provide: USERS_USECASES, useExisting: UsersService },
    UserRepository,
    { provide: USER_REPOSITORY, useExisting: UserRepository },
  ],
  exports: [USERS_USECASES, USER_REPOSITORY],
})
export class UsersModule {}
