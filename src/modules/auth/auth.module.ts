import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BcryptPasswordHasher } from './infra/security/bcrypt-password-hasher';
import { AUTH_USECASES } from './core/interfaces/primary/auth.use-cases.interface';
import { PASSWORD_HASHER } from './core/interfaces/secondary/password-hasher.interface';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_USECASES, useExisting: AuthService },
    JwtStrategy,
    BcryptPasswordHasher,
    { provide: PASSWORD_HASHER, useExisting: BcryptPasswordHasher },
  ],
  exports: [AUTH_USECASES],
})
export class AuthModule {}
