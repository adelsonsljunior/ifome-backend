// Mensagens e constantes do domínio de usuários.
export const UserMessage = {
  NOT_FOUND: 'Usuário não encontrado.',
  INVALID_ROLE: 'Papel de usuário inválido.',
  INVALID_PHONE: 'Telefone inválido. Use 10 ou 11 dígitos (DDD + número).',
} as const;

// Regex de telefone brasileiro: DDD + número, somente dígitos (10 ou 11).
export const PHONE_REGEX = /^\d{10,11}$/;
