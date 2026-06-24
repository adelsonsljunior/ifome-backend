import { ApiProperty } from '@nestjs/swagger';
import type { DietaryType, UserRole } from '../../../core/domain/entities/user';

// DTO de saída do perfil do usuário. Nunca inclui campos sensíveis (senha/hash).
export class UserProfileResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'aluno@aluno.ifal.edu.br' })
  email: string;

  @ApiProperty({ example: 'Aluno Teste' })
  name: string;

  @ApiProperty({ example: 'ALU0001' })
  enrollment: string;

  @ApiProperty({ enum: ['STUDENT', 'ADMIN'], example: 'STUDENT' })
  role: UserRole;

  @ApiProperty({ example: 'Arapiraca' })
  campus: string;

  @ApiProperty({ example: 'Sistemas de Informação' })
  course: string;

  @ApiProperty({ example: '82999991111' })
  phone: string;

  @ApiProperty({
    isArray: true,
    enum: ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree', 'spicy'],
    example: ['vegetarian'],
  })
  restrictions: DietaryType[];
}
