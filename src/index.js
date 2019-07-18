var getConfig = require('./getConfig.js')
var byMock = require('./byMock.js')
var byProxy = require('./byProxy.js')
var byStatic = require('./byStatic.js')

var config, server;


function onHandle(req, res) {
  // var handleStack = [byMock, byProxy, byStatic, show404]
  // var next = function () {
  //     var handle = handleStack.splice(0, 1)
  //     handle(res, req, next)
  // }
  // next()
  byMock(req, res, () => {
    byProxy(req, res, () => {
      byStatic(req, res, () => {
        show404(req, res)
      })
    })
  })
}


function start(configOrConfigFile, handler) {
  config = getConfig(configOrConfigFile, restart, true)
  var createServer = require('./create-server.js')
  process.title = 'dynamic-mocker';
  console.log('Current path: ' + process.cwd()
        + '\nMock root path: ' + config.mockPath
        + '\nProxy target: ' + config.proxyTarget
  );
  return server = createServer(config.isHttps, config.port, handler || onHandle);


  function restart() {
    close()
    start(configOrConfigFile)
  }
}

function close() {
  if (server) {
    server.close();
    server = null
  }
  config.closeWatcher()
}

function checkStart(configFile, handler) {
  console.log('checkStart() is deprecated by start()')
  start(configFile, handler)
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

module.exports = {
  start,
  checkStart,
  config,
  byMock,
  byProxy,
  close,
}

//当子线程send的时候触发此方法
process.stdin.on('data', function (msg) {
  if (msg.toString() === 'closeServer') {
    // console.log('EXIT by closeServer')
    close()
    process.exit(0)
  }
});
