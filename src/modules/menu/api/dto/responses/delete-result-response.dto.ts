import { ApiProperty } from '@nestjs/swagger';

// DTO de saída de uma remoção bem-sucedida.
export class DeleteResultResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
