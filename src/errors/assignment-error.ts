import { HoloscopeError } from './base-error'

export class AssignmentError extends HoloscopeError {
  constructor(prop: string | symbol) {
    super(`Error trying to set scope property "${prop.toString()}".`)
  }
}
