var path = require('path');

module.exports = function getConfig(configOrConfigFile, forceReload) {
  if (forceReload) {
    if (typeof configOrConfigFile === 'string') {
      var absConfigFile = path.resolve(configOrConfigFile);
      delete require.cache[absConfigFile];
      var config = require(absConfigFile);

      //切换当前目录
      // process.chdir(path.dirname(absFile))
      config.relativePath = path.resolve(process.cwd(), path.dirname(configOrConfigFile))
      config.absConfigFile = absConfigFile

    } else {
      config = configOrConfigFile
      config.relativePath = '.'
    }
  }


  return config
}

