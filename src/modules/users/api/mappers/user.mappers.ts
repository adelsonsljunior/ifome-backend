import { User } from '../../core/domain/entities/user';
import { MealHistory } from '../../core/domain/entities/meal-history';
import { RecentConfirmationReadModel } from '../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { PaginationReadModel } from '../../../../shared/domain/read-models/pagination/pagination.read-model';
import { PaginationResponseDto } from '../../../../common/dto/responses/pagination-response.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { UserProfileResponseDto } from '../dto/responses/user-profile-response.dto';
import { MealHistoryResponseDto } from '../dto/responses/meal-history-response.dto';
import { RecentConfirmationResponseDto } from '../dto/responses/recent-confirmation-response.dto';

// Formata um Date apenas como data (YYYY-MM-DD).
const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

// Converte entidade de domínio <-> DTO da camada de API.
export class UserApiMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id as string,
      email: user.email,
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
      campus: user.campus,
      course: user.course,
      phone: user.phone,
    };
  }

  static toProfileResponse(user: User): UserProfileResponseDto {
    return {
      id: user.id as string,
      email: user.email,
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
      campus: user.campus,
      course: user.course,
      phone: user.phone,
      restrictions: user.dietaryRestrictions,
    };
  }

  static toMealHistoryResponse(history: MealHistory): MealHistoryResponseDto {
    return {
      id: history.id as string,
      date: toDateOnly(history.date),
      period: history.period,
      dish: history.dish,
      rating: history.rating,
      recordedAt: (history.recordedAt as Date).toISOString(),
    };
  }

  static toMealHistoryPage(
    page: PaginationReadModel<MealHistory>,
  ): PaginationResponseDto<MealHistoryResponseDto> {
    return new PaginationResponseDto(
      page.data.map((item) => this.toMealHistoryResponse(item)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }

  static toRecentConfirmationResponse(
    confirmation: RecentConfirmationReadModel,
  ): RecentConfirmationResponseDto {
    return {
      id: confirmation.id,
      userId: confirmation.userId,
      userName: confirmation.userName,
      userEnrollment: confirmation.userEnrollment,
      mealDate: toDateOnly(confirmation.mealDate),
      mealPeriod: confirmation.mealPeriod,
      type: confirmation.type,
      confirmedAt: confirmation.confirmedAt.toISOString(),
    };
  }
}
