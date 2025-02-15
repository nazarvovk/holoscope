#### 0.9.0 (2025-02-15)

##### Chores

*  add readme (4ba2e9db)
*  eslint upgrade to v9 & swap to tsup (2e4822e3)
*  upgrade packages (b1fa1eaa)
*  run test workflow on push to main (#7) (5d717249)

##### New Features

*  remove the stupid $$typeof workaround (cf66bab2)

#### 0.7.0-rc.0 (2023-07-02)

##### New Features

*  asResolvers object (71d657c0)
*  asResolvers - resolve on access (6a47d9c2)

#### 0.7.0-rc.0 (2023-06-15)

##### New Features

*  export factory resolver, add cached helpers (a630744d)
*  wrap raw values with asValue at injection-time (f0903951)
* **test:**  add $$typeof test (1a511129)

#### 0.6.2 (2023-06-04)

##### Chores

*  bump v0.6.1 (7d1e9a1b)

##### New Features

*  asResolvers dispose (f41cf789)
*  pass container to disposer (cd4930b5)
*  container $$typeof (02cccef2)

##### Bug Fixes

*  export asResolvers (9785f4a0)
*  github publish, maybe? (d596e0d3)

##### Refactors

*  types (f9bcc648)
*  rm unused type import (8d5d6ca1)

#### 0.6.0 (2023-06-03)

##### Chores

*  jest config update (ec0c97ef)
*  add bundle analyzer (35e8ea29)
*  upgrade dependencies (465f45a3)
*  rollup build (43baa89b)
*  changelog generator (a250252e)
*  update github workflows (6219da88)

##### New Features

*  remove error on assignment to scope (9afd8a4b)
*  asResolvers (a121df2a)

##### Bug Fixes

*  isResolver (f872d88e)
*  test types & canonical name (3ced9378)
*  prepublish script use pnpm (f9638e95)

##### Other Changes

* //github.com/nazarvovk/holoscope (dcb97f6c)

##### Refactors

*  remove example in comment (e639c360)
*  rm errors except for resolution error + use in instead of Object.hasOwn (c1a1aae0)
*  unnecessary anonymous func in asFunction (fba03da7)
*  container type (78da80dd)
*  factory resolver, reduce bundle size (88b0d4f7)

#### 0.5.5 (2023-06-02)

##### Chores

*  update github workflows (6219da88)

##### Bug Fixes

*  prepublish script use pnpm (f9638e95)

##### Other Changes

* //github.com/nazarvovk/holoscope (dcb97f6c)

# [0.3.0](https://github.com/nazarvovk/holoscope/compare/v0.2.0...v0.3.0) (2022-02-05)


### Features

* inject option ([#4](https://github.com/nazarvovk/holoscope/issues/4)) ([4b6a1e3](https://github.com/nazarvovk/holoscope/commit/4b6a1e3f1b54369be352cee578cdbe6386214f19))



# [0.2.0](https://github.com/nazarvovk/holoscope/compare/f24b15d7cd7481acae51a28d89a6d986ba930bb2...v0.2.0) (2021-12-31)


### Bug Fixes

* build config ([a11f5ca](https://github.com/nazarvovk/holoscope/commit/a11f5caa10bd0b7ad15c4fa35e6fb21692d101a3))
* child scope typings ([2466189](https://github.com/nazarvovk/holoscope/commit/246618968807f0d92f969ae4d5677a4d5b101e66))
* ts errors ([3b70b27](https://github.com/nazarvovk/holoscope/commit/3b70b2747b7c74a5e17b95bde2a4cf387955d8d7))


### Features

* add mailmap ([fc33d8a](https://github.com/nazarvovk/holoscope/commit/fc33d8abeadb7be23084d422ed215b235f5b715f))
* add prepublishOnly script ([bc52e8f](https://github.com/nazarvovk/holoscope/commit/bc52e8f2605a1217e239ebaf1a5037f4bc849277))
* alias resolver ([7babc6c](https://github.com/nazarvovk/holoscope/commit/7babc6c5c580a753c407dff8982bd3f4e9140662))
* child scopes ([0f4d6d9](https://github.com/nazarvovk/holoscope/commit/0f4d6d9945393ca254a02ac6b5b4e170921bf68d))
* class resolver ([ff6ea4c](https://github.com/nazarvovk/holoscope/commit/ff6ea4c15bcbb47c2b6d9eb45b688e2a0246f770))
* dispose ([04a7b5f](https://github.com/nazarvovk/holoscope/commit/04a7b5f01d0b2cc3923abd02bc3b177dc9f3a375))
* errors ([#1](https://github.com/nazarvovk/holoscope/issues/1)) ([af68364](https://github.com/nazarvovk/holoscope/commit/af6836422666abdca7def3dedcd716973e8015d3))
* first steps ([041b686](https://github.com/nazarvovk/holoscope/commit/041b686929f37bbcee20e1e70e2aedbf262a334e))
* function resolver ([35c17dc](https://github.com/nazarvovk/holoscope/commit/35c17dc696a508eb76052ef0684a312f5e213a01))
* function resolver cache ([450bcd0](https://github.com/nazarvovk/holoscope/commit/450bcd024e0ed57a83c6292509e7dc073fba651a))
* init commit ([f24b15d](https://github.com/nazarvovk/holoscope/commit/f24b15d7cd7481acae51a28d89a6d986ba930bb2))
* prepare for publishing ([939d562](https://github.com/nazarvovk/holoscope/commit/939d562bef8ab0d8d8747b154870656a975650a2))
* register assert ([e65ea29](https://github.com/nazarvovk/holoscope/commit/e65ea292397e09c2d1229d627b5625db11eeae54))
* reserved registration name error ([#2](https://github.com/nazarvovk/holoscope/issues/2)) ([81073bb](https://github.com/nazarvovk/holoscope/commit/81073bbb7fc1be6040c8a788c773337cd35722e4))
* **test:** twice removed child fallback ([f51a8cd](https://github.com/nazarvovk/holoscope/commit/f51a8cdefd2a999bc4b35a1ba22c6bae045822c3))



