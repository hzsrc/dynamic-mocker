var path = require('path');
var fs = require('fs');
var glob = require('glob')

module.exports = function (config) {
  if (config.absConfigFile && config.mockPath) {
    config.genClientJs = config.genClientJs || 'mockClient.js'
    var mockConfigDir = path.dirname(config.absConfigFile)
    var targetPathName = path.join(mockConfigDir, config.genClientJs)
    var targetPath = path.resolve(path.dirname(targetPathName))
    var importJs = getImportJs(config.mockPath, posixPath(mockConfigDir), posixPath(targetPath));
    var relConfigFile = path.relative(path.dirname(targetPathName), config.absConfigFile).replace(/\\/g, '/')

    var js = `/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client.js'
import config from './${relConfigFile}'

mockClient.setup(config, {
${importJs}
})
`
    fs.writeFile(targetPathName, js, e => 0)
  }
}

function getImportJs(mockPathOrArr, mockConfigDir, relConfigPath) {
  var requires = [];
  [].concat(mockPathOrArr).map(p => {
    var rootDir = path.posix.join(mockConfigDir, p)
    var list = glob.sync(path.join(rootDir, '/**/*.js')).map(file => {
      var pathname = path.posix.relative(rootDir, file)
      var jspath = pathname.slice(0, pathname.length - 3)
      var requirePath = path.posix.relative(relConfigPath, file)
      if (requirePath[0] !== '.') requirePath = './' + requirePath
      return `  '/${jspath}': require('${requirePath}')`
    })
    requires = requires.concat(list)
  })
  return requires.join(',\n')
}

function posixPath(path) {
  return path.replace(/\\/g, '/')
}
