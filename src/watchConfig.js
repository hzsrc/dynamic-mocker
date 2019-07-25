var fs = require('fs');

module.exports = function () {
    var watcher;
    var timeHd = 0;

    this.watch = function (config, restart) {
        if (config.absConfigFile) {
            this.close()
            watcher = fs.watch(config.absConfigFile, type => {
                clearTimeout(timeHd)
                timeHd = setTimeout(() => {
                    this.close()
                    restart()
                }, 500)
            })
        }
    }


    this.close = function () {
        if (watcher) {
            watcher.close()
            watcher = null
        }
    }
}

