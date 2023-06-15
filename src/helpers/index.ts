import { Class, asClass } from '../resolver'
import type { FactoryResolverOptions } from '../resolver/factory-resolver'
import { ConstructorFunction, asFunction } from '../resolver/function-resolver'

export const asCachedFunction = <TValue>(
  function_: ConstructorFunction<TValue>,
  options?: FactoryResolverOptions<TValue>,
) => asFunction(function_, { cached: true, ...options })

export const asCachedClass = <TValue>(
  class_: Class<TValue>,
  options?: FactoryResolverOptions<TValue>,
) => asClass(class_, { cached: true, ...options })
