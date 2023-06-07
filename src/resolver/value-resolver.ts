import { IS_RESOLVER, Resolver } from './resolver'

export const asValue = <T>(value: T): Resolver<T> => ({
  [IS_RESOLVER]: true,
  resolve: () => value,
})
