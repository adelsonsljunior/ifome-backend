import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AUTH_USECASES,
  type IAuthUseCases,
} from './core/interfaces/primary/auth.use-cases.interface';
import { LoginDto } from './api/dto/requests/login.dto';
import { LoginResponseDto } from './api/dto/responses/login-response.dto';
import { LogoutResponseDto } from './api/dto/responses/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_USECASES)
    private readonly authUseCases: IAuthUseCases,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const { user, token, expiresIn } = await this.authUseCases.login(
      dto.email,
      dto.password,
      dto.rememberMe,
    );

    return { success: true, role: user.role, token, expiresIn };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(): LogoutResponseDto {
    // JWT é stateless: o logout efetivo é o cliente descartar o token.
    // (Revogação server-side exigiria uma blocklist — fora do escopo da issue #3.)
    return { success: true };
  }
}
