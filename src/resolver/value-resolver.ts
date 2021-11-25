import { Resolver, IS_RESOLVER } from '../resolver'

class ValueResolver<T> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  constructor(private value: T) {}

  resolve(): T {
    return this.value
  }
}

export const asValue = <T>(value: T): ValueResolver<T> => new ValueResolver(value)
