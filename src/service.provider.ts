import { Provider } from '@nestjs/common';
import {
  AbstractRepository,
  Connection,
  ConnectionOptions,
  Repository,
} from 'typeorm';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './basic.service';

export function getOrmServiceToken(
  entity: Function,
  connection: Connection | ConnectionOptions | string,
) {
  const repoToken = getRepositoryToken(entity, connection);
  return `${repoToken}Service`;
}

export function createServiceProviders(
  entities: Function[],
  options,
): Provider[] {
  return entities.map(entity => ({
    provide: getOrmServiceToken(entity, options),
    useFactory: (connection: Connection) => {
      if (
        entity.prototype instanceof Repository ||
        entity.prototype instanceof AbstractRepository
      ) {
        return new Service<unknown>(connection.getCustomRepository(entity));
      }

      return connection.options.type === 'mongodb'
        ? new Service<unknown>(connection.getMongoRepository(entity))
        : new Service<unknown>(connection.getRepository(entity));
    },
    inject: [getConnectionToken(options)],
  }));
}
