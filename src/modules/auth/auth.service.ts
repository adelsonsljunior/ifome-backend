import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  USERS_USECASES,
  type IUsersUseCases,
} from '../users/core/interfaces/primary/user.use-cases.interface';
import { CredentialsBuilder } from './core/domain/entities/credentials';
import { AuthMessage } from './core/message/auth.message';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from './core/interfaces/secondary/password-hasher.interface';
import {
  IAuthUseCases,
  LoginResult,
} from './core/interfaces/primary/auth.use-cases.interface';
import { InvalidEntityException } from '../../shared/domain/exceptions/invalid-entity.exception';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REMEMBER_ME_TTL_SECONDS,
} from './auth.constants';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService implements IAuthUseCases {
  constructor(
    @Inject(USERS_USECASES)
    private readonly usersUseCases: IUsersUseCases,
    private readonly jwtService: JwtService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async login(
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<LoginResult> {
    const credentials = this.buildCredentials(email, password);

    const user = await this.usersUseCases.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
    }

    const passwordMatches = await this.passwordHasher.compare(
      credentials.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
    }

    const expiresIn = rememberMe
      ? REMEMBER_ME_TTL_SECONDS
      : ACCESS_TOKEN_TTL_SECONDS;

    const payload: JwtPayload = {
      sub: user.id as string,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload, { expiresIn });

    return { user, token, expiresIn };
  }

  // Valida as credenciais no domínio e traduz o erro de domínio para 401,
  // mantendo a mensagem genérica (evita enumeração de usuários).
  private buildCredentials(email: string, password: string) {
    try {
      return new CredentialsBuilder()
        .withEmail(email)
        .withPassword(password)
        .build();
    } catch (error) {
      if (error instanceof InvalidEntityException) {
        throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
      }
      throw error;
    }
  }
}
