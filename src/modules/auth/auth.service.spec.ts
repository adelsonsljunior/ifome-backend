import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  USERS_USECASES,
  type IUsersUseCases,
} from '../users/core/interfaces/primary/user.use-cases.interface';
import { JwtService } from '@nestjs/jwt';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from './core/interfaces/secondary/password-hasher.interface';
import { UnauthorizedException } from '@nestjs/common';
import { UserBuilder } from '../users/core/domain/entities/user';
import { AuthMessage } from './core/message/auth.message';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REMEMBER_ME_TTL_SECONDS,
} from './auth.constants';

describe('AuthService', () => {
  let service: AuthService;
  let usersUseCasesMock: jest.Mocked<Pick<IUsersUseCases, 'findByEmail'>>;
  let jwtServiceMock: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let passwordHasherMock: jest.Mocked<Pick<IPasswordHasher, 'compare'>>;

  beforeEach(async () => {
    usersUseCasesMock = {
      findByEmail: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    passwordHasherMock = {
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USERS_USECASES,
          useValue: usersUseCasesMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const validEmail = 'test@ifal.edu.br';
  const validPassword = 'password123'; // >= 8 chars
  const validUser = new UserBuilder()
    .withId('user-id-123')
    .withEmail(validEmail)
    .withPassword('hashed-password-123')
    .withName('Test User')
    .withEnrollment('202312345')
    .withRole('STUDENT')
    .withCampus('Maceió')
    .withCourse('TSI')
    .withPhone('82999999999')
    .build();

  describe('login', () => {
    it('should throw UnauthorizedException when email domain is invalid (domain validation error)', async () => {
      const invalidEmail = 'test@example.com';
      await expect(service.login(invalidEmail, validPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(service.login(invalidEmail, validPassword)).rejects.toThrow(
        AuthMessage.INVALID_CREDENTIALS,
      );

      // Verify that findByEmail was not called
      expect(usersUseCasesMock.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is too short (domain validation error)', async () => {
      const shortPassword = '123';
      await expect(service.login(validEmail, shortPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(service.login(validEmail, shortPassword)).rejects.toThrow(
        AuthMessage.INVALID_CREDENTIALS,
      );

      // Verify that findByEmail was not called
      expect(usersUseCasesMock.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersUseCasesMock.findByEmail.mockResolvedValue(null);

      await expect(service.login(validEmail, validPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(service.login(validEmail, validPassword)).rejects.toThrow(
        AuthMessage.INVALID_CREDENTIALS,
      );

      expect(usersUseCasesMock.findByEmail).toHaveBeenCalledWith(validEmail);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      usersUseCasesMock.findByEmail.mockResolvedValue(validUser);
      passwordHasherMock.compare.mockResolvedValue(false);

      await expect(service.login(validEmail, validPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(service.login(validEmail, validPassword)).rejects.toThrow(
        AuthMessage.INVALID_CREDENTIALS,
      );

      expect(usersUseCasesMock.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(passwordHasherMock.compare).toHaveBeenCalledWith(
        validPassword,
        validUser.password,
      );
    });

    it('should succeed and return user, token, and ACCESS_TOKEN_TTL_SECONDS when rememberMe is false', async () => {
      usersUseCasesMock.findByEmail.mockResolvedValue(validUser);
      passwordHasherMock.compare.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token-access');

      const result = await service.login(validEmail, validPassword, false);

      expect(result).toEqual({
        user: validUser,
        token: 'jwt-token-access',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        {
          sub: validUser.id,
          email: validUser.email,
          role: validUser.role,
        },
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      );
    });

    it('should succeed and return user, token, and ACCESS_TOKEN_TTL_SECONDS when rememberMe is omitted', async () => {
      usersUseCasesMock.findByEmail.mockResolvedValue(validUser);
      passwordHasherMock.compare.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token-default');

      const result = await service.login(validEmail, validPassword);

      expect(result).toEqual({
        user: validUser,
        token: 'jwt-token-default',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        {
          sub: validUser.id,
          email: validUser.email,
          role: validUser.role,
        },
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      );
    });

    it('should succeed and return user, token, and REMEMBER_ME_TTL_SECONDS when rememberMe is true', async () => {
      usersUseCasesMock.findByEmail.mockResolvedValue(validUser);
      passwordHasherMock.compare.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token-remember');

      const result = await service.login(validEmail, validPassword, true);

      expect(result).toEqual({
        user: validUser,
        token: 'jwt-token-remember',
        expiresIn: REMEMBER_ME_TTL_SECONDS,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        {
          sub: validUser.id,
          email: validUser.email,
          role: validUser.role,
        },
        { expiresIn: REMEMBER_ME_TTL_SECONDS },
      );
    });
  });
});
