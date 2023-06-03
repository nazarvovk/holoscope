import { Container, ContainerOf } from '../types'
import { Resolver, IS_RESOLVER, isResolver } from './resolver'

export type Factory<T> = (container: ContainerOf<T>) => T

export type FactoryResolverOptions<TValue> = {
  /**
   * If true, the factory is called once
   * and all the subsequent resolutions return the cached value
   */
  cached?: boolean

  /**
   * Inject the container with values when resolving this dependency.
   */
  inject?: Record<string | symbol, unknown>

  /**
   * Function that is called when the scope is disposed.
   * Accepts the value as the only argument.
   *
   * If `cached` is true, disposer is called only if value was resolved before.
   *
   * If disposer returns a Promise, it is awaited.
   */
  disposer?: (value: TValue) => void | Promise<void>
}

export class FactoryResolver<TValue> implements Resolver<TValue> {
  readonly [IS_RESOLVER] = true

  private cache: TValue | null = null

  constructor(
    private factory: Factory<TValue>,
    private options: FactoryResolverOptions<TValue> = {},
  ) {}

  private getInjectionProxyContainer(container: Container) {
    const { inject } = this.options
    if (!inject) {
      return container
    }

    return new Proxy(container, {
      get: (originalContainer, dependencyName: keyof Container, proxy) => {
        // using Object.hasOwn so that if inject overwrites a dependency with undefined or null,
        // that injected value is returned
        if (Object.hasOwn(inject, dependencyName)) {
          const injectedDependency = inject[dependencyName]
          if (isResolver(injectedDependency)) {
            return injectedDependency.resolve(proxy)
          }
          return injectedDependency
        }
        return originalContainer[dependencyName]
      },
    })
  }

  /**
   * Get the value of the dependency given the container.
   * Handles per-resolver inject.
   */
  private getValue(container: Container): TValue {
    const dependencyProxy = this.getInjectionProxyContainer(container) as ContainerOf<TValue>
    return this.factory(dependencyProxy)
  }

  public resolve(container: Container): TValue {
    if (this.options.cached && this.cache) {
      return this.cache
    }

    const value = this.getValue(container)

    if (this.options.cached) {
      this.cache = value
    }

    return value
  }

  public async dispose(container: any): Promise<void> {
    const { disposer, cached, inject } = this.options

    if (inject) {
      await Promise.all(
        Object.values(inject).map(async (injection) => {
          if (isResolver(injection)) {
            return injection.dispose?.(container)
          }
        }),
      )
    }

    if (disposer) {
      if (cached) {
        if (this.cache) {
          await disposer(this.cache)
        }
      } else {
        const value = this.getValue(container)
        await disposer(value)
      }
    }

    this.cache = null
  }
}
