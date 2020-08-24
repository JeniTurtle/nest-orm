import { getMetadataArgsStorage } from 'typeorm';
import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createServiceProviders } from './service.provider';
import { OrmConfig, OrmAsyncConfig } from './orm.interface';
import { createOrmAsyncOptionsProvider, getOrmOptionToken } from './orm.provider';

@Module({})
class OrmConfigModule {
  static forRootAsync(options: OrmAsyncConfig) {
    const optionsProvider = createOrmAsyncOptionsProvider(options);
    return {
      module: OrmConfigModule,
      providers: [optionsProvider],
      exports: [optionsProvider],
    };
  }
}

@Global()
@Module({})
export class OrmModule {
  static forRootAsync(options: OrmAsyncConfig): DynamicModule {
    const typeormModule = TypeOrmModule.forRootAsync({
      imports: [OrmConfigModule.forRootAsync(options)],
      name: options.name,
      useFactory: (ormConfig: OrmConfig) => ormConfig,
      inject: [getOrmOptionToken(options.name)],
    });
    const groups: { [props: string]: Function[] } = {};
    const tables = getMetadataArgsStorage().tables.filter(table => !table.database || table.database === options.name || table.database === 'default');
    for (const table of tables) {
      const key = table.database || 'default';
      if (!groups[key]) {
        groups[key] = [];
      }
      if (typeof table.target === 'string') {
        continue;
      }
      groups[key].push(table.target);
    }
    const providers: Provider[] = [];
    Object.keys(groups).forEach(connection => {
      const serviceProviders = createServiceProviders(
        groups[connection],
        connection,
      );
      serviceProviders.forEach(item => providers.push(item));
    });
    return {
      module: OrmModule,
      imports: [typeormModule],
      providers,
      exports: [typeormModule, ...providers],
    };
  }
}
