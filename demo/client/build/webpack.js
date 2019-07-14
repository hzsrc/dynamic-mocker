var path = require('path')
var webpack = require('webpack')

function resolve(dir) {
    return path.resolve(__dirname, '..', dir)
}

var webpackConfig = {
    mode: 'production',
    entry: {
        app: resolve('src/app.js')
    },
    output: {
        path: resolve('./'),
        filename: '[name].js',
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [resolve('src')],
                use: [
                    'babel-loader?cacheDirectory',
                ],
            },
        ]
    }
}

webpack(webpackConfig, (err, stats) => {
    if (err) {
        throw err
    }
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n')

    console.log('  Build complete.\n')
})