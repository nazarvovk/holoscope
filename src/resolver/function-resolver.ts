import { Resolver, IS_RESOLVER } from '../resolver'
import type { Scope } from '../scope'
import { AbstractValues } from '../types'

type Fn<T, TDependencies extends AbstractValues> = (scope: Scope<TDependencies>) => T
type FunctionResolverOptions<T> = {
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

class FunctionResolver<T, TDependencies extends AbstractValues = AbstractValues>
  implements Resolver<T, TDependencies>
{
  readonly [IS_RESOLVER] = true

  private cache: T | null = null

  constructor(
    private func: Fn<T, TDependencies>,
    private options: FunctionResolverOptions<T> = {},
  ) {}

  public resolve(scope: Scope<TDependencies>): T {
    if (this.options.cached) {
      return this.cache ?? (this.cache = this.func(scope))
    }
    return this.func(scope)
  }

  public async dispose(scope: Scope<TDependencies>): Promise<void> {
    const { disposer, cached } = this.options

    if (cached) {
      if (this.cache) {
        await disposer(this.cache)
      }
    } else {
      const value = this.func(scope)
      await disposer(value)
    }

    this.cache = null
  }
}

export const asFunction = <T, TDependencies extends AbstractValues = AbstractValues>(
  value: Fn<T, TDependencies>,
  options?: FunctionResolverOptions<T>,
): FunctionResolver<T> => new FunctionResolver(value, options)
