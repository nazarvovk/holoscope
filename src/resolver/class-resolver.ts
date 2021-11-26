import { Resolver, IS_RESOLVER } from '../resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Class<T, TDependencies extends AbstractValues> = new (scope: Scope<TDependencies>) => T
type ClassResolverOptions = {
  cached?: boolean
}

class ClassResolver<T, TDependencies extends AbstractValues = AbstractValues>
  implements Resolver<T, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: T | null = null

  constructor(private cls: Class<T, TDependencies>, private options: ClassResolverOptions = {}) {}

  resolve(scope: Scope<TDependencies>): T {
    if (this.options.cached) {
      return this.cache ?? (this.cache = new this.cls(scope))
    }
    return new this.cls(scope)
  }
}

export const asClass = <T, TDependencies extends AbstractValues = AbstractValues>(
  value: Class<T, TDependencies>,
  options?: ClassResolverOptions,
): ClassResolver<T> => new ClassResolver(value, options)
