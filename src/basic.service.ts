import {
  ObjectID,
  FindConditions,
  DeepPartial,
  FindManyOptions,
  FindOperator,
  Repository,
  Equal,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Raw,
  UpdateResult,
  ObjectLiteral,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { OrmHepler } from './orm.helper';
import {
  ENTITY_ID_COLUMN,
  ENTITY_SOFT_DELETE_COLUMN,
  ENTITY_CREATED_USER_COLUMN,
  ENTITY_UPDATED_USER_COLUMN,
} from './decorator/decorator.constant';
import { ServiceConstructor } from './orm.interface';

type FindParams<E> = { orderBy?: string } & FindManyOptions<E>;

export interface BuildWhereOptions {
  condition: string;
  value: object;
}

export function getFindOperator(
  key: string,
  value: any,
): [string, FindOperator<any>] {
  const offset = key.lastIndexOf('_');
  const attr = key.substring(0, offset);
  const operator = key.substring(offset + 1);

  switch (operator) {
    case 'eq':
    case 'equal':
      if (value === null) {
        return [attr, IsNull()];
      }
      return [attr, Equal(value)];
    case 'not':
      return [attr, Not(value)];
    case 'lt':
    case 'lessThan':
      return [attr, LessThan(value)];
    case 'lte':
      return [attr, Not(MoreThan(value))];
    case 'gt':
    case 'moreThan':
      return [attr, MoreThan(value)];
    case 'gte':
      return [attr, Not(LessThan(value))];
    case 'in':
      return [attr, In(value)];
    case 'contains':
      return [attr, Raw(alias => `LOWER(${alias}) LIKE LOWER('%${value}%')`)];
    case 'startsWith':
      return [attr, Raw(alias => `LOWER(${alias}) LIKE LOWER('${value}%')`)];
    case 'endsWith':
      return [attr, Raw(alias => `LOWER(${alias}) LIKE LOWER('%${value}')`)];
    default:
      return [key, value];
  }
}

export function getWhereOperator(attr: string, value: any, id: string) {
  const offset = attr.lastIndexOf('_');
  const key = attr.substring(0, offset);
  const variable = attr + id;
  const operator = attr.substring(offset + 1);

  switch (operator) {
    case 'eq':
      if (value === null) {
        return {
          condition: `${key} is null`,
          value: {},
        };
      }
      return {
        condition: `${key} = :${variable}`,
        value: { [variable]: value },
      };
    case 'not':
      if (value === null) {
        return {
          condition: `${key} is not null`,
          value: {},
        };
      }
      return {
        condition: `${key} != :${variable}`,
        value: { [variable]: value },
      };
    case 'lt':
      return {
        condition: `${key} < :${variable}`,
        value: { [variable]: value },
      };
    case 'lte':
      return {
        condition: `${key} <= :${variable}`,
        value: { [variable]: value },
      };
    case 'gt':
      return {
        condition: `${key} > :${variable}`,
        value: { [variable]: value },
      };
    case 'gte':
      return {
        condition: `${key} >= :${variable}`,
        value: { [variable]: value },
      };
    case 'in':
      return {
        condition: `${key} in (:...${variable})`,
        value: { [variable]: value },
      };
    case 'contains':
      return {
        condition: `${key} like %:${variable}%`,
        value: { [variable]: value },
      };
    case 'startsWith':
      return {
        condition: `${key} like :${variable}%`,
        value: { [variable]: value },
      };
    case 'endsWith':
      return {
        condition: `${key} like %:${variable}`,
        value: { [variable]: value },
      };
    default:
      if (value === null) {
        return {
          condition: `${attr} is null`,
          value: {},
        };
      }
      return {
        condition: `${attr} = :${variable}`,
        value: { [variable]: value },
      };
  }
}

export class Service<E> {
  private entity: Function;
  private idColumn: keyof E;
  private createdUserColumn: keyof E;
  private updatedUserColumn: keyof E;
  private softDeleteColumn: {
    [props: string]: string | number;
  };

  constructor(public readonly repository: Repository<E>) {
    this.setMetadata();
  }

  private setMetadata() {
    this.entity = this.repository.metadata.target as Function;
    this.idColumn = Reflect.getMetadata(ENTITY_ID_COLUMN, this.entity);
    this.createdUserColumn = Reflect.getMetadata(
      ENTITY_CREATED_USER_COLUMN,
      this.entity,
    );
    this.updatedUserColumn = Reflect.getMetadata(
      ENTITY_UPDATED_USER_COLUMN,
      this.entity,
    );
    this.softDeleteColumn = Reflect.getMetadata(
      ENTITY_SOFT_DELETE_COLUMN,
      this.entity,
    );
  }

  private findOption(findOptions: FindParams<E> = {}): FindManyOptions<E> {
    const { where = {}, select, orderBy } = findOptions;
    if (select && this.idColumn) {
      if (select.indexOf(this.idColumn) === -1) {
        select.push(this.idColumn);
      }
    }
    if (orderBy) {
      const parts = orderBy.toString().split('_');
      const attr: any = parts[0];
      const direction = parts[1] as 'ASC' | 'DESC' | 1 | -1;
      // @ts-ignore
      findOptions.order = {
        [attr]: direction,
      };
    }
    findOptions.where = this.processWhereOptions(where);
    return findOptions;
  }

  async query<T>(query: string, parameters?: any[]): Promise<T> {
    const ret = await this.repository.query(query, parameters);
    return OrmHepler.snakeToHump(ret);
  }

  async find(params: FindParams<E> = {}): Promise<E[]> {
    if (Array.isArray(params.select) && params.select.length < 1) {
      params.select = undefined;
    }
    const findOptions = await this.findOption(params);
    return await this.repository.find({
      ...findOptions,
    });
  }

  async count(
    where: FindConditions<E>[] | FindConditions<E> | ObjectLiteral | string,
  ): Promise<number> {
    const findOptions = await this.findOption({ where });
    return await this.repository.count(findOptions);
  }

  async findAndCount(
    params: FindParams<E> = {},
  ): Promise<{
    rows: E[];
    count: number;
  }> {
    const findOptions = await this.findOption(params);
    const [rows, count] = await this.repository.findAndCount(findOptions);
    return { rows, count };
  }

  async findOne(params: FindParams<E> = {}): Promise<E | null> {
    const items = await this.find({
      ...params,
      take: 1,
    });
    return items.length > 0 ? items[0] : null;
  }

  async findById(
    id: string | number,
    options: FindParams<E> = {},
  ): Promise<E | null> {
    return await this.findOne({
      ...options,
      where: {
        id,
      },
    });
  }

  async delete(
    where:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindConditions<E>,
    userId: any,
  ): Promise<UpdateResult> {
    if (!this.softDeleteColumn) {
      throw new Error(
        `${this.repository.metadata.name} no '@SoftDeleteColumn()' decorator bound`,
      );
    }
    return this.update(
      {
        ...this.softDeleteColumn,
      } as any,
      where,
      userId,
    );
  }

  async deleteById(id: string | number, userId: any) {
    if (!this.softDeleteColumn) {
      throw new Error(
        `${this.repository.metadata.name} no '@SoftDeleteColumn()' decorator bound`,
      );
    }
    return this.updateById(
      {
        ...this.softDeleteColumn,
      } as any,
      id,
      userId,
    );
  }

  async create(data: DeepPartial<E>, userId: any): Promise<E> {
    if (this.createdUserColumn) {
      data[this.createdUserColumn] = userId;
    }
    const results = await this.repository.create([data]);
    return await this.repository.save(results[0], { reload: true });
  }

  async createMany(data: Array<DeepPartial<E>>, userId: any): Promise<E[]> {
    data.forEach(item => {
      if (this.createdUserColumn) {
        item[this.createdUserColumn] = userId;
      }
    });
    const results = await this.repository.create(data);
    return await this.repository.save(results, { reload: true });
  }

  async updateById(data: DeepPartial<E>, id: any, userId: any) {
    const where: FindConditions<E> = {};
    where[this.idColumn] = id;
    return await this.updateOne(data, where, userId);
  }

  async update(
    partialEntity: QueryDeepPartialEntity<E>,
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindConditions<E>,
    userId: any,
  ) {
    if (this.updatedUserColumn) {
      partialEntity[this.updatedUserColumn] = userId;
    }
    return await this.repository.update(criteria, partialEntity);
  }

  async updateOne(
    data: DeepPartial<E>,
    where: FindConditions<E>,
    userId: any,
  ): Promise<E | false> {
    if (this.updatedUserColumn) {
      data[this.updatedUserColumn] = userId;
    }
    const found = await this.findOne({
      where,
    });
    if (!found) {
      return false;
    }
    const merged = this.repository.merge(found, data);
    return await this.repository.save(merged);
  }

  async upsert(
    data: DeepPartial<E>,
    where: FindConditions<E>,
    userId: any,
  ): Promise<E> {
    if (this.updatedUserColumn) {
      data[this.updatedUserColumn] = userId;
    }
    const found = await this.findOne({
      where,
    });
    if (!found) {
      return await this.create(data, userId);
    }
    const merged = this.repository.merge(found, data);
    return await this.repository.save(merged);
  }

  // async updateMany(
  //   data: QueryDeepPartialEntity<E>,
  //   where: FindConditions<E>[] | FindConditions<E> | ObjectLiteral | string,
  // ): Promise<UpdateResult> {
  //   let builder = this.repository
  //     .createQueryBuilder()
  //     .update(this.entity)
  //     .set(data);
  //   const whereOptions = this.buildWhereCondition(where);

  //   if (Array.isArray(whereOptions[0])) {
  //     for (const index in whereOptions) {
  //       const item = whereOptions[index] as BuildWhereOptions[];
  //       const brackets = new Brackets(qb => {
  //         for (const key in item) {
  //           if (Number(key) === 0) {
  //             qb = qb.where(item[key].condition, item[key].value);
  //           } else {
  //             qb = qb.andWhere(item[key].condition, item[key].value);
  //           }
  //         }
  //       });
  //       if (Number(index) === 0) {
  //         builder = builder.where(brackets);
  //       } else {
  //         builder = builder.orWhere(brackets);
  //       }
  //     }
  //   } else {
  //     for (const index in whereOptions) {
  //       const item = whereOptions[index] as BuildWhereOptions;
  //       if (Number(index) === 0) {
  //         builder = builder.where(item.condition, item.value);
  //       } else {
  //         builder = builder.andWhere(item.condition, item.value);
  //       }
  //     }
  //   }
  //   return builder.execute();
  // }

  private buildWhereCondition(
    where: FindConditions<E>[] | FindConditions<E> | ObjectLiteral | string,
    idOrder = 0,
  ) {
    const generateId = (num: number) =>
      String(num)
        .split('')
        .map(val => 'ABCDEFGHIJ'[Number(val)])
        .join('');
    if (Array.isArray(where)) {
      const orWhereOptions: Array<BuildWhereOptions[]> = [];
      Object.keys(where).forEach(k => {
        const whereOptions: BuildWhereOptions[] = [];
        Object.keys(where[k]).forEach(key => {
          if (where[k][key] === undefined) {
            return;
          }
          const whereData = getWhereOperator(
            String(key),
            where[k][key],
            generateId(idOrder++),
          );
          whereOptions.push(whereData);
        });
        orWhereOptions.push(whereOptions);
      });
      return orWhereOptions;
    } else {
      const whereOptions: BuildWhereOptions[] = [];
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined) {
          const whereData = getWhereOperator(
            String(key),
            where[key],
            generateId(idOrder++),
          );
          whereOptions.push(whereData);
        }
      });
      return whereOptions;
    }
  }

  processWhereOptions<W extends any>(where: W) {
    if (Array.isArray(where)) {
      const whereOptions: Array<{ [key: string]: FindOperator<any> }> = [];
      Object.keys(where).forEach(k => {
        const options: any = {};
        for (const index in where[k]) {
          const key = index as keyof W;
          if (where[k][key] !== undefined) {
            const [attr, operator] = getFindOperator(
              String(key),
              where[k][key],
            );
            options[attr] = operator;
          }
        }
        whereOptions.push(options);
      });
      return whereOptions;
    } else {
      const whereOptions: { [key: string]: FindOperator<any> } = {};
      Object.keys(where).forEach(k => {
        const key = k as keyof W;
        if (where[key] !== undefined) {
          const [attr, operator] = getFindOperator(String(key), where[key]);
          whereOptions[attr] = operator;
        }
      });
      return whereOptions;
    }
  }
}

export class BasicService {
  static serviceMap: Map<string, any> = new Map();

  static getService<T, S extends Service<T> = Service<T>>(repository: Repository<T>): S {
    // @ts-ignore
    const serviceConstructor = repository.manager.connection.options.serviceClass;
    const ServiceClass: ServiceConstructor<T, S> = typeof serviceConstructor === 'function' ? serviceConstructor : Service;
    const className = repository.metadata.tablePath;
    if (this.serviceMap.has(className)) {
      const service: S = this.serviceMap.get(className);
      if (service && service.repository === repository) {
        return service;
      }
    }
    const newService: S = new ServiceClass(repository);
    this.serviceMap.set(className, newService);
    return newService;
  }

  getService<T, S extends Service<T> = Service<T>>(repository: Repository<T>) {
    return BasicService.getService<T, S>(repository);
  }
}
