import { Container } from '../types'

export const IS_RESOLVER = Symbol.for('IS_RESOLVER')

export interface Resolver<TValue> {
  resolve: (container: Container) => TValue

  dispose?: (container: unknown) => Promise<void>

  [IS_RESOLVER]: true
}

export const isResolver = (value: unknown): value is Resolver<unknown> =>
  Boolean(value && typeof value === 'object' && Object.hasOwn(value, IS_RESOLVER))
