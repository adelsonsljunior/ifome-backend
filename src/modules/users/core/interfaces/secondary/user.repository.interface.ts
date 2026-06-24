import type { InjectionToken } from '@nestjs/common';
import { User } from '../../domain/entities/user';

// Porta de saída: repositório de usuários (implementação Prisma vive em infra).
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export const USER_REPOSITORY: InjectionToken<IUserRepository> =
  Symbol('IUserRepository');
