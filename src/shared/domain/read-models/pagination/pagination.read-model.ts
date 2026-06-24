// Read-model genérico e compartilhado de paginação.
// TypeScript puro: sem @ApiProperty, sem Nest, sem Prisma. Um só, nunca por feature.
export class PaginationReadModel<T> {
  constructor(
    public readonly data: T[],
    public readonly page: number,
    public readonly pageSize: number,
    public readonly total: number,
    public readonly totalPages: number,
  ) {}

  // Fábrica que calcula totalPages a partir de total/pageSize.
  static create<T>(
    data: T[],
    page: number,
    pageSize: number,
    total: number,
  ): PaginationReadModel<T> {
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    return new PaginationReadModel<T>(data, page, pageSize, total, totalPages);
  }
}
