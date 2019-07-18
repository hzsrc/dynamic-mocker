var path = require('path'); var fs = require('fs');
var config;
var watcher;
var timeHd = 0;

var _initPath = process.cwd()
//启动服务
function getConfig(configOrConfigFile, restart, forceReload) {
  if (!config || forceReload) {
    if (typeof configOrConfigFile === 'string') {
      process.chdir(_initPath)
      configOrConfigFile = path.resolve(configOrConfigFile);
      delete require.cache[configOrConfigFile];
      config = require(configOrConfigFile);

      //切换当前目录
      process.chdir(path.dirname(configOrConfigFile))

      watchConfig();
    }
    else {
      config = configOrConfigFile
    }
  }

  return config

  function watchConfig() {
    config.closeWatcher = closeWatcher
    closeWatcher()
    watcher = fs.watch(configOrConfigFile, type => {
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
