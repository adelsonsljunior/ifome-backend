import type { InjectionToken } from '@nestjs/common';

// Porta de saída: hashing de senha. Mantém domínio/serviço independentes do bcrypt.
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASHER: InjectionToken<IPasswordHasher> =
  Symbol('IPasswordHasher');
