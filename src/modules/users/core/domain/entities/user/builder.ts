import { User } from './entity';
import { DietaryType, UserProps, UserRole } from './props';
import { UserMessage } from '../../../message/user.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

const VALID_ROLES: readonly UserRole[] = ['STUDENT', 'ADMIN'];

// Único caminho para construir/validar a entidade User.
// `id` ausente = entidade nova (o banco gera via uuidv7()); presente = reconstrução do banco.
export class UserBuilder {
  private props: Partial<UserProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withEmail(email: string): this {
    this.props.email = email;
    return this;
  }

  public withPassword(password?: string): this {
    this.props.password = password;
    return this;
  }

  public withName(name: string): this {
    this.props.name = name;
    return this;
  }

  public withEnrollment(enrollment: string): this {
    this.props.enrollment = enrollment;
    return this;
  }

  public withRole(role: UserRole): this {
    this.props.role = role;
    return this;
  }

  public withCampus(campus: string): this {
    this.props.campus = campus;
    return this;
  }

  public withCourse(course: string): this {
    this.props.course = course;
    return this;
  }

  public withPhone(phone: string): this {
    this.props.phone = phone;
    return this;
  }

  public withDietaryRestrictions(dietaryRestrictions?: DietaryType[]): this {
    this.props.dietaryRestrictions = dietaryRestrictions;
    return this;
  }

  public withCreatedAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  public withUpdatedAt(updatedAt: Date): this {
    this.props.updatedAt = updatedAt;
    return this;
  }

  public build(): User {
    if (!this.props.email)
      throw new InvalidEntityException('User', 'email is required');
    if (!this.props.name)
      throw new InvalidEntityException('User', 'name is required');
    if (!this.props.enrollment)
      throw new InvalidEntityException('User', 'enrollment is required');
    if (!this.props.role)
      throw new InvalidEntityException('User', 'role is required');
    if (!VALID_ROLES.includes(this.props.role))
      throw new InvalidEntityException('User', UserMessage.INVALID_ROLE);
    if (!this.props.campus)
      throw new InvalidEntityException('User', 'campus is required');
    if (!this.props.course)
      throw new InvalidEntityException('User', 'course is required');
    if (!this.props.phone)
      throw new InvalidEntityException('User', 'phone is required');

    return User.create({
      id: this.props.id, // opcional: ausente = banco gera
      email: this.props.email,
      // senha pode não vir em projeções de leitura (ex.: findById) — nunca exposta.
      password: this.props.password ?? '',
      name: this.props.name,
      enrollment: this.props.enrollment,
      role: this.props.role,
      campus: this.props.campus,
      course: this.props.course,
      phone: this.props.phone,
      dietaryRestrictions: this.props.dietaryRestrictions,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
