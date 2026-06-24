// Papel do usuário no domínio. Espelha os valores do enum Role do banco,
// mas é definido aqui para manter o domínio independente do Prisma.
export type UserRole = 'STUDENT' | 'ADMIN';

// Propriedades de um usuário.
// `id`, `createdAt` e `updatedAt` são opcionais: só existem após a persistência
// (o banco gera o id via uuidv7()). Uma entidade "nova" não os possui.
export interface UserProps {
  id?: string;
  email: string;
  password: string; // hash; nunca exposto nas respostas
  name: string;
  enrollment: string;
  role: UserRole;
  campus: string;
  course: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}
