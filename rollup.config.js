const typescript = require('@rollup/plugin-typescript')

/**
 * @type {import('rollup').RollupOptions}
 */
exports.default = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript({
    exclude: ["**/*.test.ts"]
  })],
}
