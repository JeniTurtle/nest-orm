import { ObjectType, getMetadataArgsStorage } from 'typeorm';
import { ScopedTableMetadata } from '../decorator';

export function unscoped<Entity>(target: ObjectType<Entity>) {
  const table = getMetadataArgsStorage().tables.find(
    table => table.target === target,
  ) as ScopedTableMetadata<Entity> | undefined;
  table.scopesEnabled = false;
  return target;
}
