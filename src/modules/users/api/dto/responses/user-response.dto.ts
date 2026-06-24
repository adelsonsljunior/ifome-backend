import { UserRole } from '../../../core/domain/entities/user';

// DTO de saída do usuário. Nunca inclui campos sensíveis (senha/hash).
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  enrollment: string;
  role: UserRole;
  campus: string;
  course: string;
  phone: string;
}
