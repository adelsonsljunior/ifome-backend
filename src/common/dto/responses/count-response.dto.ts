import { ApiProperty } from '@nestjs/swagger';

// Resposta genérica de contagem (ex.: alertas não resolvidos, notificações não lidas).
export class CountResponseDto {
  @ApiProperty({ example: 0 })
  count: number;

  constructor(count: number) {
    this.count = count;
  }
}
