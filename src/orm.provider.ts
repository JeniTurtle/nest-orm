import * as path from 'path';
import { Provider, Logger } from '@nestjs/common';
import { ORM_OPTION } from './orm.constants';
import { OrmAsyncConfig } from './orm.interface';
import { OrmLogger } from './orm.logger';

export function createOrmAsyncOptionsProvider(
  options: OrmAsyncConfig,
): Provider {
  return {
    provide: ORM_OPTION,
    useFactory: async (...args) => {
      const config = await options.useFactory(...args);
      const dirs = ['entities', 'migrations', 'subscribers'];
      const pathHandler = (props: string[], target: any) => {
        if (!target) {
          return;
        }
        for (const key of props) {
          if (target[key] && config.env !== 'debug') {
            target[key] = target[key].map((item: string) =>
              path.resolve(config.rootDir, item.replace(/\.ts$/, '.js')),
            );
          }
        }
      };
      pathHandler(dirs, config);
      const nestLogger = config.nestLogger || new Logger('TypeOrmLogger');
      // @ts-ignore
      config.logger = config.logger || new OrmLogger(nestLogger, config.logging);
      delete config.nestLogger;
      return config;
    },
    inject: options.inject || [],
  };
}
