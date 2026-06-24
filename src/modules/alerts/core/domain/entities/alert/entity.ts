import { AlertLevel, AlertProps, AlertType } from './props';

// Entidade de domínio de um alerta da gestão.
// TypeScript puro: sem Nest, sem Prisma. Construída somente via AlertBuilder.
export class Alert {
  private constructor(private readonly props: AlertProps) {}

  static create(props: AlertProps): Alert {
    return new Alert(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get level(): AlertLevel {
    return this.props.level;
  }

  get type(): AlertType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  get relatedId(): string | null | undefined {
    return this.props.relatedId;
  }

  get resolvedAt(): Date | null | undefined {
    return this.props.resolvedAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
