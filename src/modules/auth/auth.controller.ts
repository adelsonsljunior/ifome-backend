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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AUTH_USECASES,
  type IAuthUseCases,
} from './core/interfaces/primary/auth.use-cases.interface';
import { LoginDto } from './api/dto/requests/login.dto';
import { LoginResponseDto } from './api/dto/responses/login-response.dto';
import { LogoutResponseDto } from './api/dto/responses/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_USECASES)
    private readonly authUseCases: IAuthUseCases,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica o usuário e retorna um token JWT' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const { token } = await this.authUseCases.login(
      dto.email,
      dto.password,
      dto.rememberMe,
    );

    return { token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encerra a sessão (descarte do token pelo cliente)',
  })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  logout(): LogoutResponseDto {
    // JWT é stateless: o logout efetivo é o cliente descartar o token.
    // (Revogação server-side exigiria uma blocklist — fora do escopo da issue #3.)
    return { success: true };
  }
}
