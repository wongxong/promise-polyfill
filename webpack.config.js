

module.exports = {
  mode: 'production',
  entry: './src/polyfill.js',
  output: {
    filename: 'promise-polyfill.js',
    libraryTarget: 'umd',
    library: 'MyPromise'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}