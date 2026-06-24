// Mensagens e constantes do domínio de autenticação.
export const AuthMessage = {
  // Mensagem genérica: não revela se o e-mail existe (evita enumeração).
  INVALID_CREDENTIALS: 'Credenciais inválidas.',
  INVALID_EMAIL_DOMAIN:
    'O e-mail deve pertencer a @ifal.edu.br ou @aluno.ifal.edu.br.',
  PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 8 caracteres.',
} as const;

// Domínios de e-mail permitidos para autenticação.
export const ALLOWED_EMAIL_DOMAINS = [
  '@ifal.edu.br',
  '@aluno.ifal.edu.br',
] as const;

// Tamanho mínimo da senha (critério de aceite da issue #3).
export const MIN_PASSWORD_LENGTH = 8;
