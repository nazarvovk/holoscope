import { Scope, asRaw } from './scope'

describe(`${Scope.name}`, () => {
  const TEST_VALUE = 'TEST_VALUE'
  const scope = new Scope({
    test: asRaw(TEST_VALUE),
  }).register({
    testNoRegistrationWrapper: TEST_VALUE,
  })

  it('creates a scope instance', () => {
    expect(scope).toBeInstanceOf(Scope)
  })

  it('scope has the registrations', () => {
    expect(scope.test).toStrictEqual(TEST_VALUE)
    expect(scope.testNoRegistrationWrapper).toStrictEqual(TEST_VALUE)
  })
})
