var path = require('path');
var fs = require('fs');
var genClientJs = require('./genClientJs');
var config;
var watcher;
var timeHd = 0;

var _initPath = process.cwd()

//启动服务
function getConfig(configOrConfigFile, restart, forceReload) {
  if (!config || forceReload) {
    if (typeof configOrConfigFile === 'string') {
      var absFile = path.resolve(_initPath, configOrConfigFile);
      delete require.cache[absFile];
      config = require(absFile);

      //切换当前目录
      process.chdir(path.dirname(absFile))

      watchConfig();
      genClientJs(absFile, config)
    } else {
      config = configOrConfigFile
    }
  }

  return config

  function watchConfig() {
    config.closeWatcher = closeWatcher
    closeWatcher()
    watcher = fs.watch(absFile, type => {
      clearTimeout(timeHd)
      timeHd = setTimeout(() => {
        closeWatcher()
        restart()
      }, 500)
    })
  }

  function closeWatcher() {
    if (watcher) {
      watcher.close()
      watcher = null
    }
  }
}

module.exports = getConfig
