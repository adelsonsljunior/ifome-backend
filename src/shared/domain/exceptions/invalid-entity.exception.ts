// Erro de domínio lançado pelos builders ao validar uma entidade.
// TypeScript puro; é traduzido para uma exception do Nest na borda (service/controller).
export class InvalidEntityException extends Error {
  constructor(
    public readonly entity: string,
    public readonly cause: string,
  ) {
    super(`${entity}: ${cause}`);
    this.name = 'InvalidEntityException';
  }
}
