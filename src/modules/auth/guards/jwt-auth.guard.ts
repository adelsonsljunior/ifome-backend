import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Middleware de proteção de rotas: exige um JWT válido (estratégia 'jwt').
// Aplique com @UseGuards(JwtAuthGuard) nos endpoints protegidos.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
