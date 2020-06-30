import { Inject } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';
import { getOrmServiceToken } from '../service.provider';

export const InjectService = (entity: Function) => {
  const storage = getMetadataArgsStorage().tables.find(
    table => table.target === entity,
  );
  return Inject(getOrmServiceToken(entity, storage.database));
};
