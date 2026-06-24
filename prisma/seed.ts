import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';

// Seed idempotente: cria um admin e um aluno para permitir login.
// Como não há endpoint de cadastro, este seed é a única origem de usuários.
const SALT_ROUNDS = 10;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  const [adminPassword, studentPassword] = await Promise.all([
    bcrypt.hash('12345678', SALT_ROUNDS),
    bcrypt.hash('12345678', SALT_ROUNDS),
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@ifal.edu.br' },
    update: {},
    create: {
      email: 'admin@ifal.edu.br',
      password: adminPassword,
      name: 'Administrador RU',
      enrollment: 'ADM0001',
      role: Role.ADMIN,
      campus: 'Arapiraca',
      course: 'RU Management',
      phone: '82999990000',
    },
  });

  await prisma.user.upsert({
    where: { email: 'aluno@aluno.ifal.edu.br' },
    update: {},
    create: {
      email: 'aluno@aluno.ifal.edu.br',
      password: studentPassword,
      name: 'Aluno Teste',
      enrollment: 'ALU0001',
      role: Role.STUDENT,
      campus: 'Arapiraca',
      course: 'Sistemas de Informação',
      phone: '82999991111',
    },
  });

  console.log('Seed concluído: admin@ifal.edu.br / aluno@aluno.ifal.edu.br');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
