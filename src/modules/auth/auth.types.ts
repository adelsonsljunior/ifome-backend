import { UserRole } from '../users/core/domain/entities/user';

// Conteúdo do JWT assinado.
export interface JwtPayload {
  sub: string; // id do usuário
  email: string;
  role: UserRole;
}

// Usuário autenticado anexado à requisição (req.user) após o guard.
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
