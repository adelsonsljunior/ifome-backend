import { Alert } from './entity';
import { AlertLevel, AlertProps, AlertType } from './props';
import {
  ALERT_LEVELS,
  ALERT_TYPES,
  AlertMessage,
} from '../../../message/alert.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade Alert.
// `id` ausente = novo (o banco gera via uuidv7()); presente = reconstrução do banco.
export class AlertBuilder {
  private props: Partial<AlertProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withLevel(level: AlertLevel): this {
    this.props.level = level;
    return this;
  }

  public withType(type: AlertType): this {
    this.props.type = type;
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

  public withRelatedId(relatedId?: string | null): this {
    this.props.relatedId = relatedId;
    return this;
  }

  public withResolvedAt(resolvedAt?: Date | null): this {
    this.props.resolvedAt = resolvedAt;
    return this;
  }

  public withCreatedAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  public build(): Alert {
    if (!this.props.level || !ALERT_LEVELS.includes(this.props.level))
      throw new InvalidEntityException('Alert', AlertMessage.INVALID_LEVEL);
    if (!this.props.type || !ALERT_TYPES.includes(this.props.type))
      throw new InvalidEntityException('Alert', AlertMessage.INVALID_TYPE);
    if (!this.props.title)
      throw new InvalidEntityException('Alert', 'title is required');
    if (!this.props.body)
      throw new InvalidEntityException('Alert', 'body is required');

    return Alert.create({
      id: this.props.id, // opcional: ausente = banco gera
      level: this.props.level,
      type: this.props.type,
      title: this.props.title,
      body: this.props.body,
      relatedId: this.props.relatedId ?? null,
      resolvedAt: this.props.resolvedAt ?? null,
      createdAt: this.props.createdAt,
    });
  }
}
