var path = require('path'), fs = require('fs');
var config;
var watcher;
var timeHd = 0;

//启动服务
function getConfig(configOrConfigFile, restart, forceReload) {
    if (!config || forceReload) {
        if (!configOrConfigFile || typeof configOrConfigFile === 'string') {
            configOrConfigFile = path.resolve(configOrConfigFile || './config.js');
            delete require.cache[configOrConfigFile];
            config = require(configOrConfigFile);

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
