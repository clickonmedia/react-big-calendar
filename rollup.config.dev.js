import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const input = './src/index.js'

const babelOptions = {
  ignore: ['./node_modules'],
  runtimeHelpers: true,
}

export default [
  {
    input,
    output: { file: pkg.module, format: 'esm' },
    // prevent bundling all dependencies
    external: id => !id.startsWith('.') && !id.startsWith('/'),
    plugins: [babel(babelOptions)],
  },
]
