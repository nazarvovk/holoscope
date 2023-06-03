import { FactoryResolver, FactoryResolverOptions } from './factory-resolver'

type ConstructorFunction<TValue> = (...args: any[]) => TValue
type FunctionResolverOptions<TValue> = FactoryResolverOptions<TValue>

export const asFunction = <TValue>(
  function_: ConstructorFunction<TValue>,
  options?: FunctionResolverOptions<TValue>,
) => new FactoryResolver(function_, options)
