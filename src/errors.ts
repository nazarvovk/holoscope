export class ResolutionError extends Error {
  constructor(prop: string | symbol | number) {
    super(`No registration "${prop.toString()}".`)
  }
}
