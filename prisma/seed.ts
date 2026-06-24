import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ConfirmationType,
  DietaryType,
  DishCategory,
  MealPeriod,
  PrismaClient,
  Role,
} from '../src/generated/prisma/client';

// Seed idempotente: cria admins e alunos de teste (com restrições alimentares),
// um catálogo de pratos, cardápios (passado p/ histórico e próximos dias p/ a
// rota /menu/week) com seus pratos, confirmações e o histórico de refeições.
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

interface SeedDish {
  name: string;
  description: string;
  category: DishCategory;
  restrictions?: DietaryType[];
}

// Catálogo de pratos. As restrições marcam quais dietas o prato atende
// (usadas pelo filtro de /menu/week). Os nomes são referenciados nos combos.
const DISH_CATALOG: SeedDish[] = [
  {
    name: 'Arroz branco',
    description: 'Arroz branco soltinho.',
    category: DishCategory.base,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Feijão carioca',
    description: 'Feijão carioca temperado.',
    category: DishCategory.base,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Bife acebolado',
    description: 'Bife bovino grelhado com cebola.',
    category: DishCategory.protein,
    restrictions: [DietaryType.glutenFree, DietaryType.lactoseFree],
  },
  {
    name: 'Frango grelhado',
    description: 'Filé de frango grelhado.',
    category: DishCategory.protein,
    restrictions: [DietaryType.glutenFree, DietaryType.lactoseFree],
  },
  {
    name: 'Strogonoff de frango',
    description: 'Strogonoff de frango com creme de leite.',
    category: DishCategory.protein,
  },
  {
    name: 'Grão-de-bico refogado',
    description: 'Grão-de-bico refogado com legumes.',
    category: DishCategory.proteinVeg,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Omelete de legumes',
    description: 'Omelete com legumes da estação.',
    category: DishCategory.proteinVeg,
    restrictions: [DietaryType.vegetarian, DietaryType.glutenFree],
  },
  {
    name: 'Salada de alface e tomate',
    description: 'Alface, tomate e cenoura ralada.',
    category: DishCategory.salad,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Salada de beterraba',
    description: 'Beterraba cozida em cubos.',
    category: DishCategory.salad,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Farofa',
    description: 'Farofa de mandioca.',
    category: DishCategory.side,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Batata frita',
    description: 'Batata frita crocante.',
    category: DishCategory.side,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Molho apimentado',
    description: 'Molho de pimenta artesanal.',
    category: DishCategory.side,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.spicy,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Mousse de maracujá',
    description: 'Mousse cremoso de maracujá.',
    category: DishCategory.dessert,
    restrictions: [DietaryType.vegetarian, DietaryType.glutenFree],
  },
  {
    name: 'Salada de frutas',
    description: 'Mix de frutas da estação.',
    category: DishCategory.dessert,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Suco de laranja',
    description: 'Suco natural de laranja.',
    category: DishCategory.beverage,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
  {
    name: 'Refresco de uva',
    description: 'Refresco gelado de uva.',
    category: DishCategory.beverage,
    restrictions: [
      DietaryType.vegetarian,
      DietaryType.vegan,
      DietaryType.glutenFree,
      DietaryType.lactoseFree,
    ],
  },
];

// Combos servidos: cada um é uma lista ordenada de nomes do catálogo acima.
const COMBO_CARNE = [
  'Arroz branco',
  'Feijão carioca',
  'Bife acebolado',
  'Salada de alface e tomate',
  'Farofa',
  'Mousse de maracujá',
  'Suco de laranja',
];
const COMBO_VEG = [
  'Arroz branco',
  'Feijão carioca',
  'Grão-de-bico refogado',
  'Salada de beterraba',
  'Molho apimentado',
  'Salada de frutas',
  'Suco de laranja',
];
const COMBO_FRANGO = [
  'Arroz branco',
  'Feijão carioca',
  'Frango grelhado',
  'Salada de alface e tomate',
  'Batata frita',
  'Salada de frutas',
  'Refresco de uva',
];
const LUNCH_COMBOS = [COMBO_CARNE, COMBO_VEG, COMBO_FRANGO];

const LUNCH_START = new Date('1970-01-01T11:00:00Z');
const LUNCH_END = new Date('1970-01-01T14:00:00Z');
const DINNER_START = new Date('1970-01-01T17:30:00Z');
const DINNER_END = new Date('1970-01-01T20:00:00Z');

interface MealSpec {
  date: Date;
  period: MealPeriod;
  startTime: Date;
  endTime: Date;
  capacity: number;
  dishes: string[];
}

// Cardápios de -2 a +5 dias: passado alimenta o histórico; hoje e os próximos
// dias alimentam /menu/today e /menu/week (que cobre hoje..hoje+6).
function buildMealSeeds(): MealSpec[] {
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  const dayAt = (offset: number) => {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + offset);
    return date;
  };

  const specs: MealSpec[] = [];
  for (let offset = -2; offset <= 5; offset++) {
    const date = dayAt(offset);
    // Almoço todos os dias, alternando os combos.
    specs.push({
      date,
      period: MealPeriod.lunch,
      startTime: LUNCH_START,
      endTime: LUNCH_END,
      capacity: 200,
      dishes: LUNCH_COMBOS[(offset + 2) % LUNCH_COMBOS.length],
    });
    // Jantar (vegetariano) em hoje e nos dois próximos dias.
    if (offset >= 0 && offset <= 2) {
      specs.push({
        date,
        period: MealPeriod.dinner,
        startTime: DINNER_START,
        endTime: DINNER_END,
        capacity: 150,
        dishes: COMBO_VEG,
      });
    }
  }
  return specs;
}

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

  // 2) Catálogo de pratos. Sem chave única natural (o nome não é @unique),
  //    então localizamos por nome — o seed é o único escritor.
  const dishIdByName = new Map<string, string>();
  for (const seedDish of DISH_CATALOG) {
    const existing = await prisma.dish.findFirst({
      where: { name: seedDish.name },
    });
    const dish = existing
      ? await prisma.dish.update({
          where: { id: existing.id },
          data: {
            description: seedDish.description,
            category: seedDish.category,
            active: true,
          },
        })
      : await prisma.dish.create({
          data: {
            name: seedDish.name,
            description: seedDish.description,
            category: seedDish.category,
          },
        });
    dishIdByName.set(seedDish.name, dish.id);

    for (const type of seedDish.restrictions ?? []) {
      await prisma.dishRestriction.upsert({
        where: { dishId_type: { dishId: dish.id, type } },
        update: {},
        create: { dishId: dish.id, type },
      });
    }
  }

  // 3) Cardápios (upsert por date+period) + seus pratos (upsert por meal+dish).
  const meals: {
    id: string;
    date: Date;
    period: MealPeriod;
    spec: MealSpec;
  }[] = [];
  for (const spec of buildMealSeeds()) {
    const persisted = await prisma.meal.upsert({
      where: { date_period: { date: spec.date, period: spec.period } },
      update: {
        startTime: spec.startTime,
        endTime: spec.endTime,
        capacity: spec.capacity,
      },
      create: {
        date: spec.date,
        period: spec.period,
        startTime: spec.startTime,
        endTime: spec.endTime,
        capacity: spec.capacity,
      },
    });
    meals.push({
      id: persisted.id,
      date: persisted.date,
      period: persisted.period,
      spec,
    });

    let order = 0;
    for (const dishName of spec.dishes) {
      const dishId = dishIdByName.get(dishName);
      if (!dishId) continue;
      await prisma.mealDish.upsert({
        where: { mealId_dishId: { mealId: persisted.id, dishId } },
        update: { order },
        create: { mealId: persisted.id, dishId, order },
      });
      order++;
    }
  }

  const studentIds = USERS.filter((u) => u.role === Role.STUDENT)
    .map((u) => usersByEmail.get(u.email))
    .filter((id): id is string => Boolean(id));

  // 4) Confirmações (upsert por userId+mealId): cada aluno confirma os cardápios.
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

  // 5) Histórico de refeições (só dos cardápios passados/de hoje): sem chave
  //    única natural, então recriamos o conjunto dos alunos do seed.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const pastMeals = meals.filter((meal) => meal.date <= today);

  await prisma.mealHistory.deleteMany({ where: { userId: { in: studentIds } } });
  for (const studentId of studentIds) {
    await prisma.mealHistory.createMany({
      data: pastMeals.map((meal, index) => ({
        userId: studentId,
        date: meal.date,
        period: meal.period,
        // o prato "principal" do combo (proteína) é o 3º item.
        dish: meal.spec.dishes[2] ?? meal.spec.dishes[0],
        rating: ((index + 3) % 5) + 1,
      })),
    });
  }

  console.log(
    `Seed concluído: ${USERS.length} usuários, ${DISH_CATALOG.length} pratos, ` +
      `${meals.length} cardápios com pratos, confirmações e histórico para ` +
      `${studentIds.length} alunos.`,
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
