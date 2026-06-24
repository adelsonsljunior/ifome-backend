import {
  DietaryType,
  Dish,
  DishBuilder,
  DishCategory,
} from '../../../../core/domain/entities/dish';

// Linha do Prisma de um prato. `restrictions` só vem quando a query inclui a relação.
export interface DishPrismaRow {
  id: string;
  name: string;
  description: string;
  category: DishCategory;
  active: boolean;
  restrictions?: { type: DietaryType }[];
  createdAt: Date;
  updatedAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class DishPrismaMapper {
  static toDomain(row: DishPrismaRow): Dish {
    return new DishBuilder()
      .withId(row.id)
      .withName(row.name)
      .withDescription(row.description)
      .withCategory(row.category)
      .withActive(row.active)
      .withRestrictions(
        row.restrictions?.map((restriction) => restriction.type),
      )
      .withCreatedAt(row.createdAt)
      .withUpdatedAt(row.updatedAt)
      .build();
  }
}
