import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { User } from '../../../core/domain/entities/user';
import { IUserRepository } from '../../../core/interfaces/secondary/user.repository.interface';
import { UserPrismaMapper } from '../prisma/mappers/user.mappers';

// Implementação Prisma do repositório de usuários.
// Único ponto do módulo que acessa o PrismaService.
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      // select explícito: nunca traz `password` quando não é necessário.
      select: {
        id: true,
        email: true,
        name: true,
        enrollment: true,
        role: true,
        campus: true,
        course: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }
}
