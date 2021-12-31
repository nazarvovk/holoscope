import { HoloscopeError } from './base-error'

export class ReservedNameError extends HoloscopeError {
  constructor(prop: string | symbol) {
    super(`Error trying to register a reserved name "${prop.toString()}".`)
  }
}
