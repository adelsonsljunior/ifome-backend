import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIzNDU2Ny04OWFiLWNkZWYtMDEyMy00NTY3ODlhYmNkZWYiLCJlbWFpbCI6ImFkbWluQGlmYWwuZWR1LmJyIiwicm9sZSI6IkFETUlOIn0.fake-signature-apenas-para-exemplo',
  })
  token: string;
}
