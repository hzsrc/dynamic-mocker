var express = require('express')
var webpack = require('webpack')
var webpackConfig = require('./webpack.base')
var path = require('path')
webpackConfig.devtool = 'cheap-module-eval-source-map'

var port = 8066

//进度
var readline = require('readline');
webpackConfig.plugins.push(new webpack.ProgressPlugin((percentage, msg) => {
    //移动光标
    readline.clearLine(process.stdout);
    console.log('  ' + (percentage * 100).toFixed(2) + '%', msg);
    readline.moveCursor(process.stdout, 0, -1);
}));

var app = express()
var compiler = webpack(webpackConfig);

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: false,
    watchOptions: {
        //ignored: 'node_modules/**/*.js', //忽略不用监听变更的目录
        aggregateTimeout: 300, //防止重复保存频繁重新编译,500毫秒内重复保存不打包
    },
    writeToDisk: false,
    logLevel: 'warn',
    logTime: true,
    stats: 'minimal'
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {
    }
})

app.use(devMiddleware)
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join('/', '')
app.use(staticPath, express.static('./demo/client'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    _resolve()
})

var server = app.listen(port)

module.exports = {
    ready: readyPromise,
    close: () => {
        server.close()
    }
}

