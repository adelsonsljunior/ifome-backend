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
});