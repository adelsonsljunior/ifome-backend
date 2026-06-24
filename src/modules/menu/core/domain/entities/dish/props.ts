// Categoria do prato no domínio. Espelha o enum DishCategory do banco,
// definido aqui para manter o domínio independente do Prisma.
export type DishCategory =
  | 'base'
  | 'protein'
  | 'proteinVeg'
  | 'salad'
  | 'side'
  | 'dessert'
  | 'beverage';

// Restrição alimentar no domínio. Espelha o enum DietaryType do banco.
export type DietaryType =
  | 'vegetarian'
  | 'vegan'
  | 'glutenFree'
  | 'lactoseFree'
  | 'spicy';

// Propriedades de um prato do catálogo.
// `id`, `createdAt` e `updatedAt` só existem após a persistência (o banco os gera).
export interface DishProps {
  id?: string;
  name: string;
  description: string;
  category: DishCategory;
  active: boolean;
  // Restrições atendidas pelo prato (relação DishRestriction).
  restrictions: DietaryType[];
  createdAt?: Date;
  updatedAt?: Date;
}
