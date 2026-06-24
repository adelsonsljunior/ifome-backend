import {
  User,
  UserBuilder,
  UserRole,
} from '../../../../core/domain/entities/user';

// Linha do Prisma para a entidade. A senha pode não vir selecionada (ex.: findById);
// nesse caso ela não é repassada ao builder — nunca é exposta nas respostas.
export interface UserPrismaRow {
  id: string;
  email: string;
  password?: string;
  name: string;
  enrollment: string;
  role: UserRole;
  campus: string;
  course: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class UserPrismaMapper {
  static toDomain(row: UserPrismaRow): User {
    return new UserBuilder()
      .withId(row.id)
      .withEmail(row.email)
      .withPassword(row.password)
      .withName(row.name)
      .withEnrollment(row.enrollment)
      .withRole(row.role)
      .withCampus(row.campus)
      .withCourse(row.course)
      .withPhone(row.phone)
      .withCreatedAt(row.createdAt)
      .withUpdatedAt(row.updatedAt)
      .build();
  }
}
