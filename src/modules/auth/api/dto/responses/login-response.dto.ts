import { UserRole } from '../../../../users/core/domain/entities/user';

export class LoginResponseDto {
  success: boolean;
  role?: UserRole;
  token?: string;
  expiresIn?: number; // segundos até a expiração do token
}
