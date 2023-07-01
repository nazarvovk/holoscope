import { Resolver, IS_RESOLVER, isResolver } from './resolver'
import { Container, Injection } from '../types'
import { asValue } from './value-resolver'

// type magic to make tuples work
class ResolversArrayResolver<T extends [...unknown[]]> implements Resolver<T> {
  readonly [IS_RESOLVER] = true

  private resolvers: Resolver<unknown>[]

  constructor(injections: Injection<[...T]>) {
    this.resolvers = injections.map((injection) => {
      return isResolver(injection) ? injection : asValue(injection)
    })
  }

  resolve(container: Container): T {
    return new Proxy(this.resolvers, {
      get(resolvers, property, receiver) {
        if (property === Symbol.iterator) {
          return function* () {
            for (const resolver of resolvers) {
              yield resolver.resolve(container)
            }
          }
        } else if (typeof property === 'string' && /^\d+$/.test(property)) {
          const index = parseInt(property)
          if (index >= 0 && index < resolvers.length) {
            return resolvers[index].resolve(container)
          }
        }
        return Reflect.get(resolvers, property, receiver)
      },
    }) as T
  }

  async dispose(container: Container): Promise<void> {
    await Promise.all(this.resolvers.map((resolver) => resolver.dispose?.(container)))
  }
}

export const asResolvers = <T extends [...unknown[]]>(
  resolvers: Injection<[...T]>,
): ResolversArrayResolver<T> => new ResolversArrayResolver(resolvers)
