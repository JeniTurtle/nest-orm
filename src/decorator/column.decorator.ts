import {
  ENTITY_ID_COLUMN,
  ENTITY_CREATED_USER_COLUMN,
  ENTITY_UPDATED_USER_COLUMN,
  ENTITY_SOFT_DELETE_COLUMN,
} from "./decorator.constant";
import { ApiProperty } from "@nestjs/swagger";
import { Column as TypeormColumn, ColumnOptions } from "typeorm";
import { ColumnCommonOptions } from "typeorm/decorator/options/ColumnCommonOptions";
import { ColumnWithWidthOptions } from "typeorm/decorator/options/ColumnWithWidthOptions";
import { SpatialColumnOptions } from "typeorm/decorator/options/SpatialColumnOptions";
import { ColumnWithLengthOptions } from "typeorm/decorator/options/ColumnWithLengthOptions";
import { ColumnNumericOptions } from "typeorm/decorator/options/ColumnNumericOptions";
import { ColumnEnumOptions } from "typeorm/decorator/options/ColumnEnumOptions";
import { ColumnHstoreOptions } from "typeorm/decorator/options/ColumnHstoreOptions";
import { ColumnEmbeddedOptions } from "typeorm/decorator/options/ColumnEmbeddedOptions";
import {
  ColumnType,
  SimpleColumnType,
  SpatialColumnType,
  WithLengthColumnType,
  WithPrecisionColumnType,
  WithWidthColumnType,
} from "typeorm/driver/types/ColumnTypes";

export function Column(): PropertyDecorator;
export function Column(options: ColumnOptions): PropertyDecorator;
export function Column(
  type: SimpleColumnType,
  options?: ColumnCommonOptions
): PropertyDecorator;
export function Column(
  type: SpatialColumnType,
  options?: ColumnCommonOptions & SpatialColumnOptions
): PropertyDecorator;
export function Column(
  type: WithLengthColumnType,
  options?: ColumnCommonOptions & ColumnWithLengthOptions
): PropertyDecorator;
export function Column(
  type: WithWidthColumnType,
  options?: ColumnCommonOptions & ColumnWithWidthOptions
): PropertyDecorator;
export function Column(
  type: WithPrecisionColumnType,
  options?: ColumnCommonOptions & ColumnNumericOptions
): PropertyDecorator;
export function Column(
  type: "enum",
  options?: ColumnCommonOptions & ColumnEnumOptions
): PropertyDecorator;
export function Column(
  type: "simple-enum",
  options?: ColumnCommonOptions & ColumnEnumOptions
): PropertyDecorator;
export function Column(
  type: "set",
  options?: ColumnCommonOptions & ColumnEnumOptions
): PropertyDecorator;
export function Column(
  type: "hstore",
  options?: ColumnCommonOptions & ColumnHstoreOptions
): PropertyDecorator;
export function Column(
  type: (type?: any) => Function,
  options?: ColumnEmbeddedOptions
): PropertyDecorator;
export function Column(
  typeOrOptions?:
    | ((type?: any) => Function)
    | ColumnType
    | (ColumnOptions & ColumnEmbeddedOptions),
  options?: ColumnOptions & ColumnEmbeddedOptions
): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    // @ts-ignore
    TypeormColumn(typeOrOptions, options)(object, propertyName);
    let desc;
    // @ts-ignore
    if (typeOrOptions && typeOrOptions.comment) {
      // @ts-ignore
      desc = typeOrOptions.comment;
    } else if (options && options.comment) {
      desc = options.comment;
    }
    desc &&
      ApiProperty({
        description: desc,
      })(object, propertyName);
  };
}

export function IdColumn(value?: string): Function {
  return function (object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_ID_COLUMN,
      value || propertyName,
      object.constructor
    );
  };
}

export function CreateUserColumn(value?: string): Function {
  return function (object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_CREATED_USER_COLUMN,
      value || propertyName,
      object.constructor
    );
  };
}

export function UpdateUserColumn(value?: string): Function {
  return function (object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_UPDATED_USER_COLUMN,
      value || propertyName,
      object.constructor
    );
  };
}

export function SoftDeleteColumn(value: number | string): Function {
  return function (object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_SOFT_DELETE_COLUMN,
      {
        [propertyName]: value,
      },
      object.constructor
    );
  };
}
