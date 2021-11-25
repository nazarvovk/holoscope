import type { AbstractValues, ResolverPairs } from './types'
import { isResolver, asValue } from './resolver'
import { ResolverOrValueRecord } from './types'

// @ts-expect-error no idea how to type proxy values without ts errors
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Scope<TValues extends AbstractValues> extends TValues {}

/**
 * Scope that allows dependency injection.
 *
 * @param registrations Record of values that can either be a raw value or a resolver
 * @example
 * const scope = new Scope({
 *    example: asFunction(() => true),
 *    exampleRaw: 'test',
 * })
 * scope.example // true
 * scope.exampleRaw // 'test'
 */
export class Scope<TValues extends AbstractValues> {
  private resolvers: ResolverPairs<TValues>

  constructor(resolverOrValuePairs: ResolverOrValueRecord<TValues>) {
    this.register(resolverOrValuePairs)

    return new Proxy(this, {
      get: (scope, prop, proxy) => {
        if (scope[prop]) {
          return scope[prop]
        }
        return scope.resolvers[prop].resolve(proxy)
      },
      set: (scope, prop, value) => {
        if (scope[prop]) {
          return (scope[prop] = value)
        }
        throw new Error(`Error trying to set scope property "${prop.toString()}".`)
      },
    })
  }

  register<TNewValues extends AbstractValues>(
    newRegistrations: ResolverOrValueRecord<TNewValues>,
    // This should both assert & return, but it's not yet possible w/ Typescript
  ): Scope<TValues & TNewValues> {
    for (const [key, value] of Object.entries(newRegistrations)) {
      this.resolvers = {
        ...this.resolvers,
        [key]: isResolver(value) ? value : asValue(value),
      }
    }

    return this as Scope<TValues & TNewValues>
  }
}
