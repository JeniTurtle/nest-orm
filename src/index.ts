export * from 'typeorm';
export * from '@nestjs/typeorm';
export * from './orm.module';
export * from './orm.logger';
export * from './orm.provider';
export * from './orm.interface';
export * from './snake_naming.strategy';
export * from './basic.service';
export * from './basic.entity';
export * from './decorator';
export * from './scope';
export * from './operator';

import { BasicService } from './basic.service';
import { Repository } from 'typeorm';

export function getService<T>(repository: Repository<T>) {
  return BasicService.getService<T>(repository);
}
