var path = require('path');
var fs = require('fs');

module.exports = function (absConfigFile, config) {
  if (config.genClientJs) {
    var mockConfigDir = path.dirname(absConfigFile)
    var targetPathName = path.join(mockConfigDir, config.genClientJs)
    var relConfigFile = path.relative(path.dirname(targetPathName), absConfigFile).replace(/\\/g, '/')
    var relConfigPath = path.posix.dirname(relConfigFile)
    var importJs = getImportJs(config.mockPath, relConfigPath);

    var js = `/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client'
import config from './${relConfigFile}'

mockClient.setup(config, pathname => ${importJs})
`

    fs.writeFile(targetPathName, js, e => 0)
  }
}

function getImportJs(mockPathOrArr, relConfigPath) {
  var mockPaths = [].concat(mockPathOrArr).map(p => path.posix.join(relConfigPath, p))
  var importJs = `import('./${mockPaths[0]}' + pathname + '.js')`

  for (var i = 1; i < mockPaths.length; i++) {
    importJs += `\n  .catch(e => import('./${mockPaths[i]}' + pathname + '.js'))`
  }
  return importJs;
}
