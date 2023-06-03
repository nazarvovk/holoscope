import { Container } from '../types'

export const IS_RESOLVER = Symbol.for('IS_RESOLVER')

export interface Resolver<TValue> {
  resolve: (container: Container) => TValue

  dispose?: (container: unknown) => Promise<void>

  [IS_RESOLVER]: true
}

export const isResolver = (value: any): value is Resolver<unknown> => value?.[IS_RESOLVER] === true
