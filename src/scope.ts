import type { AbstractValues, ResolverPairs } from './types'
import { isResolver, asValue } from './resolver'
import { ResolverOrValueRecord } from './types'
import { Resolver } from './resolver/resolver'

/**
 * In theory, something like this should work:
 *
 * export interface Scope<
 *   TValues extends AbstractValues,
 *   TParentValues extends AbstractValues = AbstractValues,
 * > {
 *   new (
 *     resolverOrValuePairs: ResolverOrValueRecord<TValues>,
 *     parent?: Scope<TParentValues>,
 *   ): TValues & TParentValues
 * }
 *
 * In practice it doesn't, so there is a bit of magic with @ts-expect-error
 */

// @ts-expect-error no idea how to type proxy values without ts errors
export interface Scope<
  TValues extends AbstractValues,
  TParentValues extends AbstractValues = AbstractValues,
> extends TValues,
    TParentValues {}

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
export class Scope<
  TValues extends AbstractValues = AbstractValues,
  TParentValues extends AbstractValues = AbstractValues,
> {
  private resolvers!: ResolverPairs<TValues>
  private children: Scope[] = []

  constructor(resolverOrValuePairs: ResolverOrValueRecord<TValues>, parent?: Scope<TParentValues>) {
    this.register(resolverOrValuePairs)

    return new Proxy(this, {
      get: (scope, prop, proxy) => {
        if (scope[prop]) {
          return scope[prop]
        }

        if (scope.resolvers[prop]) {
          return scope.resolvers[prop].resolve(proxy)
        }

        const inherited = parent?.[prop]
        if (!inherited) {
          throw new Error(`Resolver "${prop.toString()}" not found.`)
        }
        return inherited
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
  ): asserts this is Scope<TValues & TNewValues> {
    for (const [key, value] of Object.entries(newRegistrations)) {
      this.resolvers = {
        ...this.resolvers,
        [key]: isResolver(value) ? value : asValue(value),
      }
    }
  }

  /**
   * Call all of the resolver disposers and clear resolver cache.
   *
   * If dispose is called on a parent scope, child scopes are disposed first.
   */
  async dispose(): Promise<void> {
    // call dispose on every child scope first
    await Promise.all(this.children.map((child) => child.dispose()))

    // call dispose on every resolver of this scope
    await Promise.all(
      Object.values(this.resolvers).map((resolver: Resolver<unknown>) => {
        return resolver.dispose?.(this)
      }),
    )
  }

  /**
   * Create a child scope.
   */
  createChildScope<TChildValues extends AbstractValues>(
    registrations: ResolverOrValueRecord<TChildValues>,
  ): Scope<TChildValues, TValues & TParentValues> {
    const child = new Scope(registrations, this)

    this.children.push(child)

    return child
  }
}
