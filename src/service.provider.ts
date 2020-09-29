import { Provider } from '@nestjs/common';
import {
  AbstractRepository,
  Connection,
  ConnectionOptions,
  Repository,
} from 'typeorm';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './basic.service';
import { ServiceConstructor } from './orm.interface';

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
      // @ts-ignore
      const serviceConstructor = connection.options.serviceClass;
      const ServiceClass: ServiceConstructor<unknown> = typeof serviceConstructor === 'function' ? serviceConstructor : Service;
      if (
        entity.prototype instanceof Repository ||
        entity.prototype instanceof AbstractRepository
      ) {
        return new ServiceClass(connection.getCustomRepository(entity));
      }

      return connection.options.type === 'mongodb'
        ? new ServiceClass(connection.getMongoRepository(entity))
        : new ServiceClass(connection.getRepository(entity));
    },
    inject: [getConnectionToken(options)],
  }));
}
