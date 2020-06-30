import { SelectQueryBuilder } from 'typeorm';
import { TableMetadataArgs } from 'typeorm/metadata-args/TableMetadataArgs';

export type ScopeQB<Entity> = (
  qb: SelectQueryBuilder<Entity>,
  alias: string,
) => SelectQueryBuilder<Entity>;

export interface Scopes<Entity> {
  [props: string]: ScopeQB<Entity>;
}

export interface ScopeOptions {
  column: string;
  value: string | number | null;
  operator?:
    | 'eq'
    | 'not'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte'
    | 'in'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
}

export interface ScopedTableMetadata<Entity> extends TableMetadataArgs {
  scopes: Array<ScopeQB<Entity>>;
  scopesEnabled: boolean;
}
