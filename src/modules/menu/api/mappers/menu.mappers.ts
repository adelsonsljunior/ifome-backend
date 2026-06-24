import { Dish } from '../../core/domain/entities/dish';
import { Meal } from '../../core/domain/entities/meal';
import { MenuDayReadModel } from '../../core/domain/read-models/menu-day/menu-day.read-model';
import { DishResponseDto } from '../dto/responses/dish-response.dto';
import { MealResponseDto } from '../dto/responses/meal-response.dto';
import { MenuDayResponseDto } from '../dto/responses/menu-day-response.dto';

// Formata um Date apenas como data (YYYY-MM-DD).
const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

// Converte entidade/read-model de domínio -> DTO da camada de API.
export class MenuApiMapper {
  static toDishResponse(dish: Dish): DishResponseDto {
    return {
      id: dish.id as string,
      name: dish.name,
      description: dish.description,
      category: dish.category,
      restrictions: dish.restrictions,
      active: dish.active,
      createdAt: (dish.createdAt as Date).toISOString(),
      updatedAt: (dish.updatedAt as Date).toISOString(),
    };
  }

  static toMealResponse(meal: Meal): MealResponseDto {
    return {
      id: meal.id as string,
      date: toDateOnly(meal.date),
      period: meal.period,
      startTime: meal.startTime,
      endTime: meal.endTime,
      capacity: meal.capacity,
      dishes: meal.dishes.map((dish) => ({
        dishId: dish.dishId,
        order: dish.order,
      })),
    };
  }

  static toMenuDayResponse(day: MenuDayReadModel): MenuDayResponseDto {
    return {
      date: toDateOnly(day.date),
      meals: day.meals.map((meal) => ({
        id: meal.id,
        period: meal.period,
        startTime: meal.startTime,
        endTime: meal.endTime,
        capacity: meal.capacity,
        confirmedCount: meal.confirmedCount,
        usagePercent: meal.usagePercent,
        dishes: meal.dishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          category: dish.category,
          restrictions: dish.restrictions,
        })),
      })),
    };
  }
}
