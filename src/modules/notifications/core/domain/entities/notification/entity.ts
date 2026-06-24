import { NotificationIcon, NotificationProps } from './props';

// Entidade de domínio de uma notificação de usuário.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via NotificationBuilder.
export class Notification {
  private constructor(private readonly props: NotificationProps) {}

  static create(props: NotificationProps): Notification {
    return new Notification(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get icon(): NotificationIcon {
    return this.props.icon;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  get read(): boolean {
    return this.props.read;
  }

  get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
