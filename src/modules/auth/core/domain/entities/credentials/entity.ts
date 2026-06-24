import { CredentialsProps } from './props';

// Value object das credenciais de login. TypeScript puro.
// Construído somente via CredentialsBuilder; `create` é o factory chamado pelo builder.
export class Credentials {
  private constructor(private readonly props: CredentialsProps) {}

  static create(props: CredentialsProps): Credentials {
    return new Credentials(props);
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }
}
