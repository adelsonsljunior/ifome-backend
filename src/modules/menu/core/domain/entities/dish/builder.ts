import { Dish } from './entity';
import { DietaryType, DishCategory, DishProps } from './props';
import {
  DISH_CATEGORIES,
  DIETARY_TYPES,
  MenuMessage,
  MIN_DISH_NAME_LENGTH,
} from '../../../message/menu.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade Dish.
// `id` ausente = prato novo (o banco gera via uuidv7()); presente = reconstrução do banco.
export class DishBuilder {
  private props: Partial<DishProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withName(name: string): this {
    this.props.name = name;
    return this;
  }

  public withDescription(description: string): this {
    this.props.description = description;
    return this;
  }

  public withCategory(category: DishCategory): this {
    this.props.category = category;
    return this;
  }

  public withActive(active: boolean): this {
    this.props.active = active;
    return this;
  }

  public withRestrictions(restrictions?: DietaryType[]): this {
    this.props.restrictions = restrictions;
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

  public build(): Dish {
    if (!this.props.name)
      throw new InvalidEntityException('Dish', 'name is required');
    if (this.props.name.trim().length < MIN_DISH_NAME_LENGTH)
      throw new InvalidEntityException('Dish', MenuMessage.DISH_NAME_TOO_SHORT);
    if (!this.props.description)
      throw new InvalidEntityException('Dish', 'description is required');
    if (!this.props.category)
      throw new InvalidEntityException('Dish', 'category is required');
    if (!DISH_CATEGORIES.includes(this.props.category))
      throw new InvalidEntityException('Dish', MenuMessage.INVALID_CATEGORY);

    const restrictions = this.props.restrictions ?? [];
    for (const restriction of restrictions) {
      if (!DIETARY_TYPES.includes(restriction))
        throw new InvalidEntityException(
          'Dish',
          MenuMessage.INVALID_DIETARY_TYPE,
        );
    }

    return Dish.create({
      id: this.props.id, // opcional: ausente = banco gera
      name: this.props.name,
      description: this.props.description,
      category: this.props.category,
      active: this.props.active ?? true,
      restrictions,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    });
  }
}
