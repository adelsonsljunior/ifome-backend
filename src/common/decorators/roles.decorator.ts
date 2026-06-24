import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/core/domain/entities/user';

// Chave de metadata usada pelo RolesGuard para ler os papéis exigidos.
export const ROLES_KEY = 'roles';

// Restringe um endpoint a um ou mais papéis. Use em par com JwtAuthGuard + RolesGuard.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
