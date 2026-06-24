import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../core/interfaces/secondary/password-hasher.interface';

// Implementação da porta IPasswordHasher usando bcrypt.
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
