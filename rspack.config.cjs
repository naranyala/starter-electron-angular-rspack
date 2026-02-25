// Rspack configuration for Electron main process only
// Note: Angular frontend is built using Angular CLI for proper AOT compilation
const path = require('node:path');

const mainConfig = {
  name: 'main',
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main/index.ts',
  output: {
    path: __dirname,
    filename: 'main.cjs',
    clean: false,
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              target: 'es2020',
            },
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
              },
              target: 'es2020',
            },
          },
        },
      },
    ],
  },
  target: 'node',
  externals: {
    electron: 'commonjs2 electron',
  },
  node: {
    __dirname: true,
  },
};

module.exports = [mainConfig];
