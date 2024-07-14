var getConfig = require('./getConfig.js')
var byMock = require('./byMock.js')
var byProxy = require('./byProxy.js')
var byStatic = require('./byStatic.js')
var WatchConfig = require('./watchConfig')
var genClientJs = require('./genClientJs');

function DynamicMocker(configOrConfigFile, handler) {
    var server;
    var proxy;
    var watcher
    var config


    this.server = start()
    this.close = close
    this.config = config
    genClientJs(config)

    function start() {
        close()
        config = getConfig(configOrConfigFile, true)
        watcher = new WatchConfig()
        watcher.watch(config, restart)

        var createServer = require('./create-server.js')
        process.title = config.title || 'dynamic-mocker';
        console.log('Current path: ' + process.cwd()
            + '\nMock root path: ' + config.mockPath
            + '\nProxy target: ' + config.proxyTarget
        );
        server = createServer(config.isHttps, config.port, handler || onHandle);
        return server
    }

    function onHandle(req, res) {
        byMock(config, req, res, () => {
            proxy = byProxy(config, proxy, req, res, () => {
                byStatic(config, req, res, () => {
                    show404(req, res)
                })
            })
        })
    }


    function restart() {
        start()
    }

    function close() {
        if (server) {
            server.close();
            server = null
        }
        if (proxy) {
            proxy.close()
            proxy = null
        }
        if (watcher) {
            watcher.close()
            watcher = null
        }
    }

    function show404(req, res) {
        var resp = {
            headers: {
                'Content-Type': 'text/html'
            }
        }
        config.beforeResponse && config.beforeResponse(resp, req);
        res.writeHead(404, resp.headers);
        res.end('NOT FOUND:\t' + req.url + '<br/><hr/><i>dynamic-mocker</i>');
    }


    //当子线程send的时候触发此方法
    // process.stdin.on('data', function (msg) {
    //   if (msg.toString() === 'closeMockServer') {
    //     // console.log('EXIT by closeMockServer')
    //     close()
    //     process.exit(0)
    //   }
    // });
}

module.exports = {
    Mocker: DynamicMocker,
    start(configOrConfigFile, handler) {
        this._instance = new DynamicMocker(configOrConfigFile, handler)
        this.config = this._instance.config
        return this._instance.server
    },
    checkStart(configOrConfigFile, handler) {
        console.log('checkStart() is deprecated by start()')
        return this.start(configOrConfigFile, handler)
    },
    close() {
        if (this._instance) {
            this._instance.close()
        }
    },
    genClient(configFile) {
        var config = getConfig(configFile, true)
        genClientJs(config)
    }
}
