module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        chunkFilename: '[id].[hash].js',
        library: 'custom_test',
        libraryTarget: 'umd'
    },
    mode: 'development'
}