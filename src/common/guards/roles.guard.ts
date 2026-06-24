import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from '../../modules/auth/auth.types';
import { UserRole } from '../../modules/users/core/domain/entities/user';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Autorização por papel. Roda DEPOIS do JwtAuthGuard (req.user já populado).
// Sem @Roles no endpoint, libera (apenas a autenticação é exigida).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado para este papel.');
    }

    return true;
  }
}
