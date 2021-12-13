import { HoloscopeError } from './base-error'

export class ResolutionError extends HoloscopeError {
  constructor(prop: string | symbol) {
    super(`Resolver "${prop.toString()}" not found.`)
  }
}
