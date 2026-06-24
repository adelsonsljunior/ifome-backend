import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ConfirmationType,
  DietaryType,
  MealPeriod,
  PrismaClient,
  Role,
} from '../src/generated/prisma/client';

// Seed idempotente: cria admins e alunos de teste (com restrições alimentares),
// um cardápio recente com confirmações e o histórico de refeições dos alunos.
// Como não há endpoint de cadastro, este seed é a única origem de usuários.
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '12345678';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

interface SeedUser {
  email: string;
  name: string;
  enrollment: string;
  role: Role;
  campus: string;
  course: string;
  phone: string;
  restrictions?: DietaryType[];
}

const USERS: SeedUser[] = [
  {
    email: 'admin@ifal.edu.br',
    name: 'Administrador RU',
    enrollment: 'ADM0001',
    role: Role.ADMIN,
    campus: 'Arapiraca',
    course: 'RU Management',
    phone: '82999990000',
  },
  {
    email: 'gestor@ifal.edu.br',
    name: 'Gestor RU',
    enrollment: 'ADM0002',
    role: Role.ADMIN,
    campus: 'Maceió',
    course: 'RU Management',
    phone: '82999990001',
  },
  {
    email: 'aluno@aluno.ifal.edu.br',
    name: 'Aluno Teste',
    enrollment: 'ALU0001',
    role: Role.STUDENT,
    campus: 'Arapiraca',
    course: 'Sistemas de Informação',
    phone: '82999991111',
    restrictions: [DietaryType.vegetarian, DietaryType.lactoseFree],
  },
  {
    email: 'maria@aluno.ifal.edu.br',
    name: 'Maria Silva',
    enrollment: 'ALU0002',
    role: Role.STUDENT,
    campus: 'Arapiraca',
    course: 'Engenharia Civil',
    phone: '82999992222',
    restrictions: [DietaryType.vegan],
  },
  {
    email: 'joao@aluno.ifal.edu.br',
    name: 'João Souza',
    enrollment: 'ALU0003',
    role: Role.STUDENT,
    campus: 'Maceió',
    course: 'Agronomia',
    phone: '82999993333',
  },
];

// Cardápios recentes (um almoço por dia, nos últimos 3 dias).
function buildMealSeeds() {
  const today = new Date();
  return [0, 1, 2].map((daysAgo) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    date.setUTCHours(0, 0, 0, 0);
    return {
      date,
      period: MealPeriod.lunch,
      startTime: new Date('1970-01-01T11:00:00Z'),
      endTime: new Date('1970-01-01T14:00:00Z'),
      capacity: 200,
    };
  });
}

const DISHES = [
  'Arroz, feijão e bife acebolado',
  'Strogonoff de frango com batata palha',
  'Escondidinho de carne seca',
];

async function main() {
  // 1) Usuários (upsert por email) + restrições (upsert por userId+type).
  const usersByEmail = new Map<string, string>();
  for (const seedUser of USERS) {
    const password = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: {
        email: seedUser.email,
        password,
        name: seedUser.name,
        enrollment: seedUser.enrollment,
        role: seedUser.role,
        campus: seedUser.campus,
        course: seedUser.course,
        phone: seedUser.phone,
      },
    });
    usersByEmail.set(seedUser.email, user.id);

    for (const type of seedUser.restrictions ?? []) {
      await prisma.dietaryRestriction.upsert({
        where: { userId_type: { userId: user.id, type } },
        update: {},
        create: { userId: user.id, type },
      });
    }
  }

  // 2) Cardápios (upsert por date+period).
  const meals: Awaited<ReturnType<typeof prisma.meal.upsert>>[] = [];
  for (const meal of buildMealSeeds()) {
    const persisted = await prisma.meal.upsert({
      where: { date_period: { date: meal.date, period: meal.period } },
      update: {},
      create: meal,
    });
    meals.push(persisted);
  }

  const studentIds = USERS.filter((u) => u.role === Role.STUDENT)
    .map((u) => usersByEmail.get(u.email))
    .filter((id): id is string => Boolean(id));

  // 3) Confirmações (upsert por userId+mealId): cada aluno confirma os almoços.
  for (const studentId of studentIds) {
    for (const meal of meals) {
      await prisma.confirmation.upsert({
        where: { userId_mealId: { userId: studentId, mealId: meal.id } },
        update: {},
        create: {
          userId: studentId,
          mealId: meal.id,
          type: ConfirmationType.standard,
        },
      });
    }
  }

  // 4) Histórico de refeições: sem chave única natural, então recriamos o
  //    conjunto dos alunos do seed (delete-then-insert escopado).
  await prisma.mealHistory.deleteMany({ where: { userId: { in: studentIds } } });
  for (const studentId of studentIds) {
    await prisma.mealHistory.createMany({
      data: meals.map((meal, index) => ({
        userId: studentId,
        date: meal.date,
        period: meal.period,
        dish: DISHES[index % DISHES.length],
        rating: ((index + 3) % 5) + 1,
      })),
    });
  }

  console.log(
    `Seed concluído: ${USERS.length} usuários, ${meals.length} cardápios, ` +
      `confirmações e histórico para ${studentIds.length} alunos.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
