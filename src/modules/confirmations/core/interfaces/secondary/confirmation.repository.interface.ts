import type { InjectionToken } from '@nestjs/common';
import { Confirmation, MealPeriod } from '../../domain/entities/confirmation';
import { ConfirmationReadModel } from '../../domain/read-models/confirmation/confirmation.read-model';
import { RecentConfirmationReadModel } from '../../domain/read-models/recent-confirmation/recent-confirmation.read-model';
import { RecentConfirmationsOrder } from '../primary/confirmation.use-cases.interface';

// Resultado paginado cru do repositório: a página de itens + o total geral.
export interface PagedResult<T> {
  rows: T[];
  total: number;
}

// Projeção mínima da refeição usada para validar prazo e capacidade.
// `endTime` em 'HH:mm'; a conversão do tipo Time do banco acontece na infra.
export interface MealForConfirmation {
  id: string;
  date: Date;
  period: MealPeriod;
  endTime: string;
  capacity: number;
}

// Porta de saída: repositório de confirmações (implementação Prisma vive em infra).
export interface IConfirmationRepository {
  // Refeição de um período em uma data (para validar prazo/capacidade).
  findMealByDateAndPeriod(
    date: Date,
    period: MealPeriod,
  ): Promise<MealForConfirmation | null>;

  // Confirmações ativas de uma refeição; `exceptUserId` ignora a do próprio aluno
  // (re-confirmar não deve contar em dobro na capacidade).
  countByMeal(mealId: string, exceptUserId?: string): Promise<number>;

  // Cria ou atualiza a confirmação do aluno na refeição (unique userId+mealId).
  upsert(confirmation: Confirmation): Promise<ConfirmationReadModel>;

  // Confirmação do aluno para a data informada (ou null).
  findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<ConfirmationReadModel | null>;

  // Remove a confirmação (cancelamento = hard delete).
  deleteById(id: string): Promise<void>;

  // Listagem paginada para o painel admin.
  findRecent(
    skip: number,
    take: number,
    order: RecentConfirmationsOrder,
  ): Promise<PagedResult<RecentConfirmationReadModel>>;
}

export const CONFIRMATION_REPOSITORY: InjectionToken<IConfirmationRepository> =
  Symbol('IConfirmationRepository');
