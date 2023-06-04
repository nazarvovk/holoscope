import { FactoryResolver, FactoryResolverOptions } from './factory-resolver'

type ConstructorFunction<TValue> = (...args: any[]) => TValue

export const asFunction = <TValue>(
  function_: ConstructorFunction<TValue>,
  options?: FactoryResolverOptions<TValue>,
) => new FactoryResolver(function_, options)
