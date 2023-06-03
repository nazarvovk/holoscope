import { Resolver } from './resolver'
import { Scope } from './scope'

export type Container = {
  [key: string | symbol | number]: unknown
}

export type ValueOrResolver<T> = T | Resolver<T>

/**
 * An object of values or value resolvers
 *
 * @example ```
 * const injection: Injection = { a: 'a', b: asFunction(() => 'b') }
 * ```
 */
export type Injection<T> = {
  [K in keyof T]: ValueOrResolver<T[K]>
}

/**
 * Type of a parameter accepted by the constructor of an extendable scope
 *
 * @example
 * ```typescript
 * interface ExampleContainer {
 *   example: string
 * }
 * class ExampleScope<TExtended extends ExampleContainer> extends Scope<TExtended> {
 *   constructor(extended: ExtendedInjection<ExampleContainer, TExtended>) {
 *     const registrations: Injection<ExampleContainer> = {
 *       example: 'example',
 *     }
 *     super({
 *       ...registrations,
 *       ...extended,
 *     } as Injection<TExtended>)
 *   }
 * }
 * ```
 */
export type ExtendedInjection<TBase, TExtended extends TBase> = Injection<
  Partial<TBase> & Omit<TExtended, keyof TBase>
> | void

export type ContainerOf<T> = T extends Scope<infer TContainer> ? TContainer : never
