
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { FactoryProvider, Logger, LoggerService } from '@nestjs/common'

export type OrmConfig = {
  env: string;
  rootDir: string;
  nestLogger?: Logger | LoggerService;
} & Partial<TypeOrmModuleOptions>;

export interface OrmAsyncConfig {
  name?: string;
  useFactory: (...args: any[]) => Promise<OrmConfig> | OrmConfig;
  inject?: FactoryProvider['inject'];
}
