import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options): Options[] => {
  const commonOptions: Options = {
    entry: ['src/index.ts'],
    sourcemap: true,
    tsconfig: 'tsconfig.build.json',
    ...options,
  }

  return [
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      dts: true,
      clean: true,
    },
    {
      ...commonOptions,
      format: ['cjs'],
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ]
})
