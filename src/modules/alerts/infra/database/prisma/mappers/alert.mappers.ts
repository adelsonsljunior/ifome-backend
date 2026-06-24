import {
  Alert,
  AlertBuilder,
  AlertLevel,
  AlertType,
} from '../../../../core/domain/entities/alert';

// Nível do banco <-> domínio ('critical' <-> 'crit', 'warning' <-> 'warn').
const DB_TO_DOMAIN_LEVEL: Record<string, AlertLevel> = {
  critical: 'crit',
  warning: 'warn',
  info: 'info',
};

const DOMAIN_TO_DB_LEVEL: Record<AlertLevel, 'critical' | 'warning' | 'info'> =
  {
    crit: 'critical',
    warn: 'warning',
    info: 'info',
  };

export function levelToPrisma(
  level: AlertLevel,
): 'critical' | 'warning' | 'info' {
  return DOMAIN_TO_DB_LEVEL[level];
}

// Linha do Prisma de um alerta.
export interface AlertPrismaRow {
  id: string;
  level: 'critical' | 'warning' | 'info';
  type: AlertType;
  title: string;
  body: string;
  relatedId: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

// Converte modelo do Prisma -> entidade de domínio.
export class AlertPrismaMapper {
  static toDomain(row: AlertPrismaRow): Alert {
    return new AlertBuilder()
      .withId(row.id)
      .withLevel(DB_TO_DOMAIN_LEVEL[row.level])
      .withType(row.type)
      .withTitle(row.title)
      .withBody(row.body)
      .withRelatedId(row.relatedId)
      .withResolvedAt(row.resolvedAt)
      .withCreatedAt(row.createdAt)
      .build();
  }
}
