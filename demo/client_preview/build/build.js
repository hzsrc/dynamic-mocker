var path = require('path')
var fs = require('fs')
var webpack = require('webpack')

var webpackConfig = require('./webpack.base')

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

  fs.writeFileSync(path.join(webpackConfig.output.path, 'index.html'), fs.readFileSync(path.resolve(__dirname, '..', 'index.html')))
  console.log('  Build complete.\n')
})
