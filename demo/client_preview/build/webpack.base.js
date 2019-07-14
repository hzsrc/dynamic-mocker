var path = require('path')

function resolve(dir) {
    return path.resolve(__dirname, '..', dir)
}

var webpackConfig = {
    mode: 'production',
    entry: {
        app: resolve('src/app.js')
    },
    output: {
        path: resolve('../../preview'),
        filename: '[name].js',
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [resolve('../../src'), resolve('../../demo')],
                use: [
                    'babel-loader?cacheDirectory',
                ],
            },
        ]
    },
    optimization: {
        minimize: false,
    },
    plugins: []
}
module.exports = webpackConfig
