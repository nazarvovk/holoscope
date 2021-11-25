import { Resolver, IS_RESOLVER } from '../resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Fn<T, TDependencies extends AbstractValues> = (scope: Scope<TDependencies>) => T

class FunctionResolver<T, TDependencies extends AbstractValues = AbstractValues>
  implements Resolver<T, TDependencies>
{
  readonly [IS_RESOLVER] = true

  constructor(private func: Fn<T, TDependencies>) {}

  resolve(scope: Scope<TDependencies>): T {
    return this.func(scope)
  }
}

export const asFunction = <T, TDependencies extends AbstractValues = AbstractValues>(
  value: Fn<T, TDependencies>,
): FunctionResolver<T> => new FunctionResolver(value)
