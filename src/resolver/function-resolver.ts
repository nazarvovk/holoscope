import { Resolver, IS_RESOLVER } from '../resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Fn<T, TDependencies extends AbstractValues> = (scope: Scope<TDependencies>) => T
type FunctionResolverOptions = {
  cached?: boolean
}

class FunctionResolver<T, TDependencies extends AbstractValues = AbstractValues>
  implements Resolver<T, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: T | null = null

  constructor(private func: Fn<T, TDependencies>, private options: FunctionResolverOptions = {}) {}

  resolve(scope: Scope<TDependencies>): T {
    if (this.options.cached) {
      return this.cache ?? (this.cache = this.func(scope))
    }
    return this.func(scope)
  }
}

export const asFunction = <T, TDependencies extends AbstractValues = AbstractValues>(
  value: Fn<T, TDependencies>,
  options?: FunctionResolverOptions,
): FunctionResolver<T> => new FunctionResolver(value, options)
