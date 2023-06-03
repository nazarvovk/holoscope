import type { Container, Injection, ValueOrResolver } from './types'
import { Resolver, isResolver } from './resolver'
import { ResolutionError } from './errors'

/**
 * Scope that allows dependency injection.
 * @param registrations Record of values that can either be a raw value or a resolver
 */
export class Scope<TContainer extends Container = Container> {
  public registrations = {} as Injection<TContainer>
  private protectedRegistrations = {} as Injection<any>

  constructor(registrations: Injection<TContainer>) {
    this.register(registrations)
  }

  /**
   * Container that is passed when resolving dependencies from other dependencies
   * Differs from container, prioritizing protected registrations
   */
  private resolutionContainerProxy = new Proxy(this.registrations, {
    get: (registrations, dependencyName, proxy) => {
      let registration: ValueOrResolver<unknown>
      if (dependencyName in this.protectedRegistrations) {
        registration = this.protectedRegistrations[dependencyName as any]
      } else if (dependencyName in registrations) {
        registration = registrations[dependencyName as keyof TContainer]
      } else {
        throw new ResolutionError(dependencyName)
      }
      if (isResolver(registration)) {
        return registration.resolve(proxy)
      }
      return registration
    },
  })

  /**
   * Public container proxy.
   */
  public container = new Proxy(this.registrations, {
    get: (registrations, dependencyName) => {
      if (!(dependencyName in registrations)) {
        throw new ResolutionError(dependencyName)
      }
      const registration = registrations[dependencyName as keyof TContainer]
      if (isResolver(registration)) {
        return (registration as Resolver<unknown>).resolve(this.resolutionContainerProxy)
      }
      return registration
    },
  }) as TContainer

  public register(newRegistrations: Partial<Injection<TContainer>>): Scope<TContainer> {
    Object.assign(this.registrations, newRegistrations)
    return this
  }

  public registerProtected(protectedInjection: Injection<unknown>): Scope<TContainer> {
    Object.assign(this.protectedRegistrations, protectedInjection)
    return this
  }

  /**
   * Call all of the resolver disposers.
   */
  async dispose(): Promise<void> {
    await Promise.all(
      [...Object.values(this.registrations), ...Object.values(this.protectedRegistrations)].map(
        async (resolverOrValue: unknown) => {
          if (isResolver(resolverOrValue)) {
            await resolverOrValue.dispose?.(this.container)
          }
        },
      ),
    )
  }
}
