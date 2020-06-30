import { getMetadataArgsStorage } from 'typeorm';
import {
  ScopedTableMetadata,
  ScopeQB,
  ScopeOptions,
} from './decorator.interface';

function eqHandle(scope: ScopeOptions, conditions: any[]) {
  let condition = `${scope.column} = ${scope.value}`;
  if (scope.value === null) {
    condition = `${scope.column} IS NULL`;
  }
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function notHandle(scope: ScopeOptions, conditions: any[]) {
  let condition = `${scope.column} != ${scope.value}`;
  if (scope.value === null) {
    condition = `${scope.column} IS NOT NULL`;
  }
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function ltHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `${scope.column} < ${scope.value}`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function lteHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `${scope.column} <= ${scope.value}`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function gtHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `${scope.column} > ${scope.value}`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function gteHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `${scope.column} >= ${scope.value}`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function inHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `${scope.column} IN (${scope.value})`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function containsHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `LOWER(${scope.column}) LIKE LOWER('%${scope.value}%`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function startsWithHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `LOWER(${scope.column}) LIKE LOWER('${scope.value}%`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

function endsWithHandle(scope: ScopeOptions, conditions: any[]) {
  const condition = `LOWER(${scope.column}) LIKE LOWER('%${scope.value}`;
  conditions.push((qb, alias) => qb.andWhere(`"${alias}".${condition}`));
}

export function Scope<Entity>(
  scopes: Array<ScopeOptions>,
  enabled = true,
): Function {
  return function(target: Function) {
    const table = getMetadataArgsStorage().tables.find(
      table => table.target === target,
    ) as ScopedTableMetadata<Entity> | undefined;
    const conditions: Array<ScopeQB<Entity>> = [];
    for (const scope of scopes) {
      if (typeof scope.value === 'string') {
        scope.value = `'${scope.value}'`;
      }
      switch (scope.operator) {
        case 'eq':
          eqHandle(scope, conditions);
          break;
        case 'not':
          notHandle(scope, conditions);
          break;
        case 'lt':
          ltHandle(scope, conditions);
          break;
        case 'lte':
          lteHandle(scope, conditions);
          break;
        case 'gt':
          gtHandle(scope, conditions);
          break;
        case 'gte':
          gteHandle(scope, conditions);
          break;
        case 'in':
          inHandle(scope, conditions);
          break;
        case 'contains':
          containsHandle(scope, conditions);
          break;
        case 'startsWith':
          startsWithHandle(scope, conditions);
          break;
        case 'endsWith':
          endsWithHandle(scope, conditions);
          break;
        default:
          eqHandle(scope, conditions);
      }
    }
    if (table) {
      table.scopes = conditions;
      table.scopesEnabled = enabled;
    } else {
      throw new Error(
        'Could not find current entity in metadata store, maybe put @Scope() before @Entity()?',
      );
    }
  };
}
