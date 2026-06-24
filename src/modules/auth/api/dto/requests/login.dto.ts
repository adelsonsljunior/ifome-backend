import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MIN_PASSWORD_LENGTH } from '../../../core/message/auth.message';

export class LoginDto {
  @ApiProperty({ example: 'admin@ifal.edu.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
