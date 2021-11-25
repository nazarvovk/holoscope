const IS_REGISTRATION = Symbol.for('IS_REGISTRATION')

interface Registration<TValue, TDependencies extends AbstractValues = AbstractValues> {
  resolve(scope: Scope<TDependencies>): TValue
  [IS_REGISTRATION]: true
}

const isRegistration = <T>(value): value is Registration<T> => value[IS_REGISTRATION]

class RawRegistration<T> implements Registration<T> {
  value: T;

  readonly [IS_REGISTRATION] = true

  constructor(value: T) {
    this.value = value
  }

  resolve() {
    return this.value
  }
}

export const asRaw = <T>(value: T): RawRegistration<T> => new RawRegistration(value)
export const asValue = asRaw

type AbstractValues = Record<string | symbol, unknown>

type RegistrationsFromRecord<T extends AbstractValues> = {
  [K in keyof T]: Registration<T[K]>
}

// @ts-expect-error no idea how to type proxy values without ts errors
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Scope<TValues extends AbstractValues> extends TValues {}

export class Scope<TValues extends AbstractValues> {
  private registrations: RegistrationsFromRecord<TValues>

  constructor(registrations: RegistrationsFromRecord<TValues> | TValues) {
    this.register(registrations)

    return new Proxy(this, {
      get: (scope, prop) => {
        if (scope[prop]) {
          return scope[prop]
        }
        return scope.registrations[prop].resolve(scope)
      },
    })
  }

  register<TNewValues extends AbstractValues>(
    newRegistrations: TNewValues | RegistrationsFromRecord<TNewValues>,
  ): Scope<TValues & TNewValues> {
    for (const [key, value] of Object.entries(newRegistrations)) {
      this.registrations = {
        ...this.registrations,
        [key]: isRegistration(value) ? value : asValue(value),
      }
    }

    return this as Scope<TValues & TNewValues>
  }
}
