import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MIN_PASSWORD_LENGTH } from '../../../core/message/auth.message';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
