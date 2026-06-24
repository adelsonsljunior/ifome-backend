import type { InjectionToken } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user';
import { MealHistory } from '../../domain/entities/meal-history';
import { UpdateProfileData } from '../primary/user.use-cases.interface';

// Resultado paginado cru do repositório: a página de itens + o total geral.
export interface PagedResult<T> {
  rows: T[];
  total: number;
}

// Porta de saída: repositório de usuários (implementação Prisma vive em infra).
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findProfileById(id: string): Promise<User | null>;
  updateProfile(id: string, data: UpdateProfileData): Promise<User | null>;
  findMealHistoryPage(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PagedResult<MealHistory>>;
  findIdsByRole(role: UserRole): Promise<string[]>;
}

export const USER_REPOSITORY: InjectionToken<IUserRepository> =
  Symbol('IUserRepository');
