import {
  ENTITY_ID_COLUMN,
  ENTITY_CREATED_USER_COLUMN,
  ENTITY_UPDATED_USER_COLUMN,
  ENTITY_SOFT_DELETE_COLUMN,
} from './decorator.constant';

export function IdColumn(value?: string): Function {
  return function(object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_ID_COLUMN,
      value || propertyName,
      object.constructor,
    );
  };
}

export function CreateUserColumn(value?: string): Function {
  return function(object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_CREATED_USER_COLUMN,
      value || propertyName,
      object.constructor,
    );
  };
}

export function UpdateUserColumn(value?: string): Function {
  return function(object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_UPDATED_USER_COLUMN,
      value || propertyName,
      object.constructor,
    );
  };
}

export function SoftDeleteColumn(value: number | string): Function {
  return function(object: Record<string, any>, propertyName: string) {
    Reflect.defineMetadata(
      ENTITY_SOFT_DELETE_COLUMN,
      {
        [propertyName]: value,
      },
      object.constructor,
    );
  };
}
