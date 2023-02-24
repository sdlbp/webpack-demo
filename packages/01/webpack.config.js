  module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js'
    },
    devServer: {
      publicPath: '/dist',
      port: 8989
    },
    mode: 'development'
  }
