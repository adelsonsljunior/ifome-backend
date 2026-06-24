import { Confirmation } from './entity';
import { ConfirmationProps, ConfirmationType } from './props';
import {
  CONFIRMATION_TYPES,
  ConfirmationMessage,
} from '../../../message/confirmation.message';
import { InvalidEntityException } from '../../../../../../shared/domain/exceptions/invalid-entity.exception';

// Único caminho para construir/validar a entidade Confirmation.
// `id` ausente = confirmação nova (o banco gera via uuidv7()); presente = reconstrução do banco.
export class ConfirmationBuilder {
  private props: Partial<ConfirmationProps> = {};

  public withId(id: string): this {
    this.props.id = id;
    return this;
  }

  public withUserId(userId: string): this {
    this.props.userId = userId;
    return this;
  }

  public withMealId(mealId: string): this {
    this.props.mealId = mealId;
    return this;
  }

  public withType(type: ConfirmationType): this {
    this.props.type = type;
    return this;
  }

  public withConfirmedAt(confirmedAt: Date): this {
    this.props.confirmedAt = confirmedAt;
    return this;
  }

  public build(): Confirmation {
    if (!this.props.userId)
      throw new InvalidEntityException('Confirmation', 'userId is required');
    if (!this.props.mealId)
      throw new InvalidEntityException('Confirmation', 'mealId is required');
    if (!this.props.type)
      throw new InvalidEntityException('Confirmation', 'type is required');
    if (!CONFIRMATION_TYPES.includes(this.props.type))
      throw new InvalidEntityException(
        'Confirmation',
        ConfirmationMessage.INVALID_TYPE,
      );

    return Confirmation.create({
      id: this.props.id, // opcional: ausente = banco gera
      userId: this.props.userId,
      mealId: this.props.mealId,
      type: this.props.type,
      confirmedAt: this.props.confirmedAt,
    });
  }
}
