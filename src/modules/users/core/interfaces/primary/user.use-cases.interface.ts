import type { InjectionToken } from '@nestjs/common';
import { User } from '../../domain/entities/user';

// Porta de entrada: casos de uso de usuários (implementados pelo UsersService).
export interface IUsersUseCases {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export const USERS_USECASES: InjectionToken<IUsersUseCases> =
  Symbol('IUsersUseCases');
