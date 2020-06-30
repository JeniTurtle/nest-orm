import { FindOperator, In as TypeormIn } from 'typeorm';
export function MyIn<T>(value: T[] | FindOperator<T>): FindOperator<any> {
  return TypeormIn(Array.isArray(value) && !value.length ? [null] : value);
}
