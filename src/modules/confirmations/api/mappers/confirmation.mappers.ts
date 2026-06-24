import { ConfirmationReadModel } from '../../core/domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from '../../core/domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { PaginationReadModel } from '../../../../shared/domain/read-models/pagination/pagination.read-model';
import { PaginationResponseDto } from '../../../../common/dto/responses/pagination-response.dto';
import { ConfirmationResponseDto } from '../dto/responses/confirmation-response.dto';
import { RecentConfirmationResponseDto } from '../dto/responses/recent-confirmation-response.dto';

// Formata um Date apenas como data (YYYY-MM-DD).
const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

// Converte read-models de domínio -> DTO da camada de API.
export class ConfirmationApiMapper {
  static toConfirmationResponse(
    confirmation: ConfirmationReadModel,
  ): ConfirmationResponseDto {
    return {
      id: confirmation.id,
      mealId: confirmation.mealId,
      date: toDateOnly(confirmation.mealDate),
      period: confirmation.mealPeriod,
      type: confirmation.type,
      confirmedAt: confirmation.confirmedAt.toISOString(),
    };
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

  static toRecentConfirmationPage(
    page: PaginationReadModel<RecentConfirmationReadModel>,
  ): PaginationResponseDto<RecentConfirmationResponseDto> {
    return new PaginationResponseDto(
      page.data.map((item) => this.toRecentConfirmationResponse(item)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }
}
