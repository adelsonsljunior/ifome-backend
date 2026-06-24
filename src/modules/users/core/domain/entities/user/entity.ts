import { DietaryType, UserProps, UserRole } from './props';

// Entidade de domínio do usuário. TypeScript puro: sem Nest, sem Prisma.
// Construída somente via UserBuilder; `create` é o factory chamado pelo builder.
export class User {
  private constructor(private readonly props: UserProps) {}

  // Factory de domínio: único ponto de materialização da entidade (usado pelo builder).
  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  // Hash da senha. Uso interno (validação de credencial); nunca exposto em resposta.
  get password(): string {
    return this.props.password;
  }

  get name(): string {
    return this.props.name;
  }

  get enrollment(): string {
    return this.props.enrollment;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get campus(): string {
    return this.props.campus;
  }

  get course(): string {
    return this.props.course;
  }

  get phone(): string {
    return this.props.phone;
  }

  // Restrições alimentares; vazio quando a projeção não as carrega.
  get dietaryRestrictions(): DietaryType[] {
    return this.props.dietaryRestrictions ?? [];
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
