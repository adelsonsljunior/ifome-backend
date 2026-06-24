import { Credentials } from './entity';
import { CredentialsProps } from './props';
import {
  ALLOWED_EMAIL_DOMAINS,
  AuthMessage,
  MIN_PASSWORD_LENGTH,
} from '../../../message/auth.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar as credenciais de login.
// Concentra a regra de negócio: domínio do e-mail e tamanho mínimo da senha.
export class CredentialsBuilder {
  private props: Partial<CredentialsProps> = {};

  public withEmail(email: string): this {
    // normaliza para comparar o domínio de forma estável
    this.props.email = email.trim().toLowerCase();
    return this;
  }

  public withPassword(password: string): this {
    this.props.password = password;
    return this;
  }

  public build(): Credentials {
    const { email, password } = this.props;

    if (!email)
      throw new InvalidEntityException('Credentials', 'email is required');
    if (!password)
      throw new InvalidEntityException('Credentials', 'password is required');

    const hasAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((domain) =>
      email.endsWith(domain),
    );
    if (!hasAllowedDomain)
      throw new InvalidEntityException(
        'Credentials',
        AuthMessage.INVALID_EMAIL_DOMAIN,
      );

    if (password.length < MIN_PASSWORD_LENGTH)
      throw new InvalidEntityException(
        'Credentials',
        AuthMessage.PASSWORD_TOO_SHORT,
      );

    return Credentials.create({ email, password });
  }
}
