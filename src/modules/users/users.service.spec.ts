import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_REPOSITORY, IUserRepository } from './core/interfaces/secondary/user.repository.interface';
import { UserBuilder } from './core/domain/entities/user';
import { UserMessage } from './core/message/user.message';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IUserRepository> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findProfileById: jest.fn(),
      updateProfile: jest.fn(),
      findMealHistoryPage: jest.fn(),
      findIdsByRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(USER_REPOSITORY);
  });

  function buildUser() {
    return new UserBuilder()
      .withId('user-1')
      .withEmail('aluno@ufal.br')
      .withName('Maria Silva')
      .withEnrollment('2023001234')
      .withRole('STUDENT')
      .withCampus('A.C. Simões')
      .withCourse('Engenharia de Software')
      .withPhone('82988887777')
      .build();
  }

  describe('findByEmail', () => {
    it('deve delegar ao repositório e retornar o usuário quando encontrado', async () => {
      const user = buildUser();
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('aluno@ufal.br');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('aluno@ufal.br');
      expect(result).toBe(user);
    });

    it('deve retornar null quando o repositório não encontrar o usuário', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('inexistente@ufal.br');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve delegar ao repositório e retornar o usuário quando encontrado', async () => {
      const user = buildUser();
      userRepository.findById.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(result).toBe(user);
    });

    it('deve retornar null quando o repositório não encontrar o usuário', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById('id-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário quando encontrado', async () => {
      const user = buildUser();
      userRepository.findProfileById.mockResolvedValue(user);

      const result = await service.getProfile('user-1');

      expect(userRepository.findProfileById).toHaveBeenCalledWith('user-1');
      expect(result).toBe(user);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      userRepository.findProfileById.mockResolvedValue(null);

      await expect(service.getProfile('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException com a mensagem correta', async () => {
      userRepository.findProfileById.mockResolvedValue(null);

      await expect(service.getProfile('id-inexistente')).rejects.toThrow(
        UserMessage.NOT_FOUND,
      );
    });
  });
  describe('updateProfile', () => {
    it('deve atualizar e retornar o usuário quando encontrado', async () => {
      const updateData = { phone: '82999998888' };
      const updatedUser = buildUser();
      userRepository.updateProfile.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-1', updateData);

      expect(userRepository.updateProfile).toHaveBeenCalledWith(
        'user-1',
        updateData,
      );
      expect(result).toBe(updatedUser);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      userRepository.updateProfile.mockResolvedValue(null);

      await expect(
        service.updateProfile('id-inexistente', { phone: '82999998888' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar restrictions vazio como substituição explícita', async () => {
      const updateData = { restrictions: [] as const };
      const updatedUser = buildUser();
      userRepository.updateProfile.mockResolvedValue(updatedUser);

      await service.updateProfile('user-1', { restrictions: [] });

      expect(userRepository.updateProfile).toHaveBeenCalledWith('user-1', {
        restrictions: [],
      });
    });
  });
});