// Ícone da notificação no domínio. Espelha o enum NotificationIcon do banco.
export type NotificationIcon =
  | 'utensils'
  | 'alert'
  | 'bell'
  | 'checkCircle'
  | 'calendar';

// Propriedades de uma notificação de usuário.
// `id`, `createdAt` só existem após a persistência; `readAt` nulo enquanto não lida.
export interface NotificationProps {
  id?: string;
  userId: string;
  icon: NotificationIcon;
  title: string;
  body: string;
  read: boolean;
  readAt?: Date | null;
  createdAt?: Date;
}
