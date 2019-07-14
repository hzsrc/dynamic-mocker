var path = require('path')
var webpack = require('webpack')

function resolve(dir) {
    return path.resolve(__dirname, '..', dir)
}

var webpackConfig = {
    mode: 'production',
    entry: {
        client: resolve('src/client/index.js')
    },
    output: {
        path: resolve('lib'),
        filename: '[name].js',
        publicPath: '',
        library: 'DMockClient',
        libraryTarget: 'umd'
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
    },
    optimization: {
        minimize: false,
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
