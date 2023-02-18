import type { Injection } from './types'
import { isResolver } from './resolver'
import { AssignmentError, ResolutionError } from './errors'

/**
 * Scope that allows dependency injection.
 *
 * @param registrations Record of values that can either be a raw value or a resolver
 * @example
 * ```typescript
 * interface ExampleContainer {
 *   example1: string
 *   example2: string
 * }
 *
 * class ExampleScope extends Scope<ExampleContainer> {
 *   constructor() {
 *     super({
 *       example1: 'value1',
 *       example2: asFunction((container: ExampleContainer) => container.example1 + 'value2'),
 *     })
 *   }
 * }
 *
 * const exampleScope = new ExampleScope()
 * const example1 = exampleScope.container.example1 // 'value1'
 * const example2 = exampleScope.container.example2 // 'value1value2'
 * ```
 */
export class Scope<TContainer> {
  private registrations = {} as Injection<TContainer>

  constructor(registrations: Injection<TContainer>) {
    this.register(registrations)

    return new Proxy(this, {
      set: (_, prop) => {
        throw new AssignmentError(prop)
      },
    })
  }

  /**
   * TODO: Document
   */
  public container = new Proxy(this.registrations, {
    get: (registrations, prop, proxy) => {
      const registration = registrations[prop as keyof TContainer]
      if (registration) {
        if (isResolver(registration)) {
          return registration.resolve(proxy)
        }
        return registration
      }
      throw new ResolutionError(prop)
    },
    set: (_, prop) => {
      throw new AssignmentError(prop)
    },
  }) as TContainer

  register(newRegistrations: Partial<Injection<TContainer>>): Scope<TContainer> {
    Object.assign(this.registrations, newRegistrations)
    return this
  }

  /**
   * Call all of the resolver disposers and clear resolver cache.
   */
  async dispose(): Promise<void> {
    // call dispose on every resolver of this scope
    await Promise.all(
      Object.values(this.registrations).map(async (resolverOrValue: unknown) => {
        if (isResolver(resolverOrValue)) {
          await resolverOrValue.dispose?.(this.container)
        }
      }),
    )
  }
}
