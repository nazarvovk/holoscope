import type { Container, Injection, Registration } from './types'
import { Resolver } from './resolver'
import { ResolutionError } from './errors'
import { inject } from './inject'

/**
 * Scope that allows dependency injection.
 * @param registrations Record of values that can either be a raw value or a resolver
 */
export class Scope<TContainer extends Container = Container> {
  public registrations = {} as Registration<TContainer>
  private protectedRegistrations = {} as Registration<Record<keyof any, unknown>>

  constructor(registrations: Injection<TContainer>) {
    this.register(registrations)
  }

  /**
   * Public container proxy.
   */
  public container = new Proxy(this.registrations, {
    get: (registrations, dependencyName) => {
      if (dependencyName in registrations) {
        return registrations[dependencyName as keyof TContainer].resolve(
          this.resolutionContainerProxy,
        )
      }
      throw new ResolutionError(dependencyName)
    },
  }) as TContainer

  /**
   * Container that is passed when resolving dependencies from other dependencies
   * Differs from container, prioritizing protected registrations
   */
  private resolutionContainerProxy = new Proxy(this.container, {
    get: (registrations, dependencyName, proxy) => {
      if (dependencyName in this.protectedRegistrations) {
        return this.protectedRegistrations[dependencyName].resolve(proxy)
      }
      return this.container[dependencyName as keyof TContainer]
    },
  })

  public register(injection: Partial<Injection<TContainer>>): Scope<TContainer> {
    inject(this.registrations, injection)
    return this
  }

  public registerProtected(protectedInjection: Injection<unknown>): Scope<TContainer> {
    inject(this.protectedRegistrations, protectedInjection)
    return this
  }

  /**
   * Call all of the resolver disposers.
   */
  async dispose(): Promise<void> {
    const allRegistrations = [
      ...Object.values<Resolver<unknown>>(this.registrations),
      ...Object.values<Resolver<unknown>>(this.protectedRegistrations),
    ]
    await Promise.all(
      allRegistrations.map((resolver) => resolver.dispose?.(this.resolutionContainerProxy)),
    )
  }
}
