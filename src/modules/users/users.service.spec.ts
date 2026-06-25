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
  describe('findIdsByRole', () => {
    it('deve delegar ao repositório e retornar a lista de ids', async () => {
      const ids = ['user-1', 'user-2', 'user-3'];
      userRepository.findIdsByRole.mockResolvedValue(ids);

      const result = await service.findIdsByRole('STUDENT');

      expect(userRepository.findIdsByRole).toHaveBeenCalledWith('STUDENT');
      expect(result).toBe(ids);
    });

    it('deve retornar lista vazia quando não houver usuários com o papel', async () => {
      userRepository.findIdsByRole.mockResolvedValue([]);

      const result = await service.findIdsByRole('ADMIN');

      expect(result).toEqual([]);
    });
  });
  describe('getMealHistory', () => {
    it('deve calcular o skip corretamente e retornar a página montada', async () => {
      const mealHistoryRows = [
        { id: 'meal-1', dish: 'Feijoada' } as any,
        { id: 'meal-2', dish: 'Lasanha' } as any,
      ];
      userRepository.findMealHistoryPage.mockResolvedValue({
        rows: mealHistoryRows,
        total: 25,
      });

      const result = await service.getMealHistory('user-1', 3, 10);

      // page 3, pageSize 10 => skip = (3-1)*10 = 20
      expect(userRepository.findMealHistoryPage).toHaveBeenCalledWith(
        'user-1',
        20,
        10,
      );
      expect(result.data).toBe(mealHistoryRows);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3); // ceil(25/10) = 3
    });

    it('deve calcular skip zero para a primeira página', async () => {
      userRepository.findMealHistoryPage.mockResolvedValue({
        rows: [],
        total: 0,
      });

      await service.getMealHistory('user-1', 1, 10);

      expect(userRepository.findMealHistoryPage).toHaveBeenCalledWith(
        'user-1',
        0,
        10,
      );
    });
  });
});