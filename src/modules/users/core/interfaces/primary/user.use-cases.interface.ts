import type { InjectionToken } from '@nestjs/common';
import { DietaryType, User } from '../../domain/entities/user';
import { MealHistory } from '../../domain/entities/meal-history';
import { RecentConfirmationReadModel } from '../../domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { PaginationReadModel } from '../../../../../shared/domain/read-models/pagination/pagination.read-model';

// Dados aceitos na atualização de perfil. `restrictions` ausente = não altera;
// presente (mesmo vazio) = substitui o conjunto de restrições.
export interface UpdateProfileData {
  phone?: string;
  restrictions?: DietaryType[];
}

// Ordenação aceita para confirmações recentes (painel admin).
export type RecentConfirmationsOrder = 'recente';

// Porta de entrada: casos de uso de usuários (implementados pelo UsersService).
export interface IUsersUseCases {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  getProfile(userId: string): Promise<User>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<User>;
  getMealHistory(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationReadModel<MealHistory>>;
  getRecentConfirmations(
    limit: number,
    order: RecentConfirmationsOrder,
  ): Promise<RecentConfirmationReadModel[]>;
}

export const USERS_USECASES: InjectionToken<IUsersUseCases> =
  Symbol('IUsersUseCases');
