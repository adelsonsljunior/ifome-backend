import type { NotificationIcon } from '../domain/entities/notification/props';

// Mensagens e constantes do domínio de notificações.
export const NotificationMessage = {
  NOT_FOUND: 'Notificação não encontrada.',
  INVALID_ICON: 'Ícone de notificação inválido.',
} as const;

// Valores válidos espelhando o enum do banco.
export const NOTIFICATION_ICONS: readonly NotificationIcon[] = [
  'utensils',
  'alert',
  'bell',
  'checkCircle',
  'calendar',
];
