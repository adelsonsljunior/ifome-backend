import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DietaryType } from '../../../core/domain/entities/user';
import { PHONE_REGEX, UserMessage } from '../../../core/message/user.message';

// Valores aceitos de restrição alimentar (espelham o enum DietaryType do domínio).
const DIETARY_TYPES: DietaryType[] = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'lactoseFree',
  'spicy',
];

// Entrada da atualização de perfil. Ambos os campos são opcionais:
// `restrictions` ausente não altera; presente (mesmo vazio) substitui o conjunto.
export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: '82999990000',
    description: 'Telefone (DDD + número), somente dígitos (10 ou 11).',
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: UserMessage.INVALID_PHONE })
  phone?: string;

  @ApiPropertyOptional({
    isArray: true,
    enum: DIETARY_TYPES,
    example: ['vegetarian', 'lactoseFree'],
    description: 'Substitui o conjunto de restrições alimentares.',
  })
  @IsOptional()
  @IsIn(DIETARY_TYPES, { each: true })
  @ArrayUnique()
  restrictions?: DietaryType[];
}
