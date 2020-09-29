
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { FactoryProvider, Logger, LoggerService } from '@nestjs/common'
import { Service } from './basic.service';
import { Repository } from 'typeorm';

export interface ServiceConstructor<E> {
  new (repository: Repository<E>): Service<E>;
}

export type OrmConfig = {
  env: string;
  rootDir: string;
  nestLogger?: Logger | LoggerService;
  serviceClass?: ServiceConstructor<unknown>;
} & Partial<TypeOrmModuleOptions>;

export interface OrmAsyncConfig {
  name?: string;
  useFactory: (...args: any[]) => Promise<OrmConfig> | OrmConfig;
  inject?: FactoryProvider['inject'];
}
