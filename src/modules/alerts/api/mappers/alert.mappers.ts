import { Alert } from '../../core/domain/entities/alert';
import { DemandPointReadModel } from '../../core/domain/read-models/demand-point/demand-point.read-model';
import { PaginationReadModel } from '../../../../shared/domain/read-models/pagination/pagination.read-model';
import { PaginationResponseDto } from '../../../../common/dto/responses/pagination-response.dto';
import { AlertResponseDto } from '../dto/responses/alert-response.dto';
import { DemandPointResponseDto } from '../dto/responses/demand-point-response.dto';

// Formata um Date apenas como data (YYYY-MM-DD).
const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

// Converte entidades/read-models de domínio -> DTOs da camada de API.
export class AlertApiMapper {
  static toResponse(alert: Alert): AlertResponseDto {
    const resolvedAt = alert.resolvedAt ?? null;
    return {
      id: alert.id as string,
      level: alert.level,
      type: alert.type,
      title: alert.title,
      body: alert.body,
      relatedId: alert.relatedId ?? null,
      resolved: resolvedAt !== null,
      resolvedAt: resolvedAt ? resolvedAt.toISOString() : null,
      createdAt: (alert.createdAt as Date).toISOString(),
    };
  }

  static toPage(
    page: PaginationReadModel<Alert>,
  ): PaginationResponseDto<AlertResponseDto> {
    return new PaginationResponseDto(
      page.data.map((item) => this.toResponse(item)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }

  static toDemandResponse(point: DemandPointReadModel): DemandPointResponseDto {
    return {
      date: toDateOnly(point.date),
      period: point.period,
      count: point.count,
    };
  }

  static toDemandPage(
    page: PaginationReadModel<DemandPointReadModel>,
  ): PaginationResponseDto<DemandPointResponseDto> {
    return new PaginationResponseDto(
      page.data.map((point) => this.toDemandResponse(point)),
      page.page,
      page.pageSize,
      page.total,
      page.totalPages,
    );
  }
}
