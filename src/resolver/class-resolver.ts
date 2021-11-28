import { Resolver, IS_RESOLVER } from '../resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Class<T, TDependencies extends AbstractValues> = new (scope: Scope<TDependencies>) => T
type ClassResolverOptions<T> = {
  /**
   * If true, the function is called once
   * and all the subsequent resolutions return the cached value
   */
  cached?: boolean

  /**
   * Function that is called when the scope is disposed.
   * Accepts the value as the only argument.
   *
   * If `cached` is true, disposer is called only if value was resolved before.
   *
   * If disposer returns a Promise, it is awaited.
   */
  disposer?: (value: T) => void | Promise<void>
}

class ClassResolver<T, TDependencies extends AbstractValues = AbstractValues>
  implements Resolver<T, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: T | null = null

  constructor(
    private cls: Class<T, TDependencies>,
    private options: ClassResolverOptions<T> = {},
  ) {}

  resolve(scope: Scope<TDependencies>): T {
    if (this.options.cached) {
      return this.cache ?? (this.cache = new this.cls(scope))
    }
    return new this.cls(scope)
  }

  public async dispose(scope: Scope<TDependencies>): Promise<void> {
    const { disposer, cached } = this.options

    if (cached) {
      if (this.cache) {
        await disposer(this.cache)
      }
    } else {
      const value = new this.cls(scope)
      await disposer(value)
    }

    this.cache = null
  }
}

export const asClass = <T, TDependencies extends AbstractValues = AbstractValues>(
  value: Class<T, TDependencies>,
  options?: ClassResolverOptions<T>,
): ClassResolver<T> => new ClassResolver(value, options)
