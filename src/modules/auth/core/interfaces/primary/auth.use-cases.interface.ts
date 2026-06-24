import type { InjectionToken } from '@nestjs/common';
import { User } from '../../../../users/core/domain/entities/user';

export interface LoginResult {
  user: User;
  token: string;
  expiresIn: number;
}

// Porta de entrada: casos de uso de autenticação (implementados pelo AuthService).
export interface IAuthUseCases {
  login(
    email: string,
    password: string,
    rememberMe?: boolean,
  ): Promise<LoginResult>;
}

export const AUTH_USECASES: InjectionToken<IAuthUseCases> =
  Symbol('IAuthUseCases');
