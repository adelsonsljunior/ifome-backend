import { Notification } from './entity';
import { NotificationIcon, NotificationProps } from './props';
import {
  NOTIFICATION_ICONS,
  NotificationMessage,
} from '../../../message/notification.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade Notification.
// `id` ausente = nova (o banco gera via uuidv7()); presente = reconstrução do banco.
export class NotificationBuilder {
  private props: Partial<NotificationProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withUserId(userId: string): this {
    this.props.userId = userId;
    return this;
  }

  public withIcon(icon: NotificationIcon): this {
    this.props.icon = icon;
    return this;
  }

  public withTitle(title: string): this {
    this.props.title = title;
    return this;
  }

  public withBody(body: string): this {
    this.props.body = body;
    return this;
  }

  public withRead(read: boolean): this {
    this.props.read = read;
    return this;
  }

  public withReadAt(readAt?: Date | null): this {
    this.props.readAt = readAt;
    return this;
  }

  public withCreatedAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  public build(): Notification {
    if (!this.props.userId)
      throw new InvalidEntityException('Notification', 'userId is required');
    if (!this.props.icon || !NOTIFICATION_ICONS.includes(this.props.icon))
      throw new InvalidEntityException(
        'Notification',
        NotificationMessage.INVALID_ICON,
      );
    if (!this.props.title)
      throw new InvalidEntityException('Notification', 'title is required');
    if (!this.props.body)
      throw new InvalidEntityException('Notification', 'body is required');

    return Notification.create({
      id: this.props.id, // opcional: ausente = banco gera
      userId: this.props.userId,
      icon: this.props.icon,
      title: this.props.title,
      body: this.props.body,
      read: this.props.read ?? false,
      readAt: this.props.readAt ?? null,
      createdAt: this.props.createdAt,
    });
  }
}
