import { Scope } from '../scope'
import { AbstractValues } from '../types'

export const IS_RESOLVER = Symbol.for('IS_RESOLVER')

export interface Resolver<TValue, TDependencies extends AbstractValues = AbstractValues> {
  resolve: (scope: Scope<TDependencies>) => TValue

  dispose?: (scope: Scope<TDependencies>) => Promise<void>

  [IS_RESOLVER]: true
}

export const isResolver = <T>(value: unknown): value is Resolver<T> =>
  !!(value as Resolver<unknown>)?.[IS_RESOLVER]
