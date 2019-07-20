var path = require('path');
var fs = require('fs');

module.exports = function (absConfigFile, config) {
  if (config.genClientJs) {
    var mockPathOrArr = config.mockPath
    var mockConfigDir = path.dirname(absConfigFile)
    var configFile = path.basename(absConfigFile)
    var importJs = getImportJs(mockPathOrArr, mockConfigDir);
    var targetFile = path.join(mockConfigDir, 'mockClient.js')

    var js = `/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client'
import config from './${configFile}'

mockClient.setup(config, pathname => ${importJs})
`

    fs.writeFile(targetFile, js, e => 0)
  }
}

function getImportJs(mockPathOrArr, mockConfigDir) {
  var mockPaths = [].concat(mockPathOrArr)
  var importJs = `import('./${mockPaths[0]}' + pathname + '.js')`

  for (var i = 1; i < mockPaths.length; i++) {
    importJs += `\n  .catch(e => import('./${mockPaths[i]}' + pathname + '.js'))`
  }
  return importJs;
}
