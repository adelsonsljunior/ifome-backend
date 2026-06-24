import type { InjectionToken } from '@nestjs/common';
import { NotificationIcon } from '../../domain/entities/notification';

// Conteúdo de uma notificação a ser gerada automaticamente.
export interface NotificationPayload {
  icon: NotificationIcon;
  title: string;
  body: string;
}

// Porta interna: geração automática de notificações, consumida por outros módulos
// (ex.: menu ao publicar cardápio, alerts ao gerar alerta crítico).
export interface INotificationEngine {
  notifyUser(userId: string, payload: NotificationPayload): Promise<void>;
  notifyStudents(payload: NotificationPayload): Promise<void>;
  notifyAdmins(payload: NotificationPayload): Promise<void>;
}

export const NOTIFICATION_ENGINE: InjectionToken<INotificationEngine> = Symbol(
  'INotificationEngine',
);
