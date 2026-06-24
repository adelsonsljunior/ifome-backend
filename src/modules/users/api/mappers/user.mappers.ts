import { User } from '../../core/domain/entities/user';
import { UserResponseDto } from '../dto/responses/user-response.dto';

// Converte entidade de domínio <-> DTO da camada de API.
export class UserApiMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id as string,
      email: user.email,
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
      campus: user.campus,
      course: user.course,
      phone: user.phone,
    };
  }
}
