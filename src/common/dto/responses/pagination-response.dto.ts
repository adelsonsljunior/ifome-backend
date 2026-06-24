import { ApiProperty } from '@nestjs/swagger';

// DTO de resposta paginada genérico e compartilhado entre os módulos.
// Nunca crie um DTO de paginação por feature. O Swagger não infere `data`
// a partir do genérico — use o helper ApiPaginatedResponse por rota.
export class PaginationResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  constructor(
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    totalPages: number,
  ) {
    this.data = data;
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.totalPages = totalPages;
  }
}
