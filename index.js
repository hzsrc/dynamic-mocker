var path = require('path'), fs = require('fs');
var url = require('url'), querystring = require('querystring');
//var yaml = require('js-yaml');

var config, proxy, server;
var configWatched;

//启动服务
function loadConfig(fn) {
    if (!config) {
        var fn = fn ? path.resolve(fn) : './config.js';
        delete require.cache[fn];
        config = require(fn);

        watchConfig();
    }

    var timeHd = 0;

    function watchConfig() {
        if (!configWatched) {
            configWatched = true
            fs.watch(fn, () => {
                clearTimeout(timeHd)
                timeHd = setTimeout(restart, 500)
            })
        }
    }

    function restart() {
        close()
        start(fn)
    }
}

function getProxyTarget(urlPart) {
    var t = config.proxyTarget
    if (typeof t === 'function') {
        return t(urlPart)
    }
    return t
}

function start(configFile) {
    config = null
    loadConfig(configFile)
    var createServer = require('./create-server.js')
    process.title = 'dynamic-mocker';
    console.log('Current path: ' + __dirname
        + '\nMock root path: ' + config.mockPath
        + '\nProxy target: ' + config.proxyTarget
    );
    return server = createServer(config.isHttps, config.port, onHandle);
}

function checkStart(configFile) {
    loadConfig(configFile)
    if (config.mockEnabled) {
        start(configFile)
    }
}

function getProxy() {
    if (!proxy) {
        proxy = require('http-proxy').createProxyServer({});
        proxy.on('error', function (err, req, res, target) {
            console.log('[ERROR]:' + req.url + '\t' + err.message)
            res.end(err.message);
        });
    }
    return proxy;
}

function onHandle(req, res) {
    var urlPart = url.parse(req.url);
    req.query = querystring.parse(urlPart.query) //暂存备用

    var pathname = urlPart.pathname;
    if (config.mapFile) {
        pathname = config.mapFile(pathname, req)
    }
    if (config.mockEnabled && config.checkPath(pathname)) {
        var paths = config.mockPath;
        if (typeof paths == 'string') {
            paths = [paths];
        }
        var i = -1;
        var next = function () {
            i++;
            if (i < paths.length) {
                var mockFile = path.join(paths[i], pathname + '.js');
                if (fs.existsSync(mockFile)) {
                    //模拟数据，从mock文件夹获取
                    mockByFile(req, res, mockFile, next);
                }
                else {
                    next()
                }
            }
            else {
                //非模拟数据的ajax请求，代理给服务处理
                proxyWeb();
            }
        };
        next();
    }
    else {
        //return false
        //res.end('err');
        proxyWeb()
    }

    //由JSP或ASP.Net、PHP服务处理
    function proxyWeb() {
        if (config.proxyTarget) {
            var target = getProxyTarget(urlPart);
            console.log('proxy:\t' + pathname + '\t=>\t' + target + pathname);
            req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
            getProxy().web(req, res, {target: target});
        }
        else {
            var resp = {headers: {}}
            config.beforeResponse && config.beforeResponse(resp, req);
            res.writeHead(404, resp.headers);
            res.end('NOT FOUND');
        }
    }
}

//使用js文件模拟内容输出
function mockByFile(req, res, mockFile, next) {
    //var js = '(function(){var exports={},module={exports:exports};' + fs.readFileSync(mockFile) + ';return module.exports})()';
    var fullMockFile = path.resolve(mockFile);
    delete require.cache[fullMockFile]; //根据绝对路径，清空缓存的对象
    try {
        var mockData = require(fullMockFile) || {};
    }
    catch (e) {
        res.writeHead(500, {});
        var error = `Error in file:${mockFile}:\n` + e;
        console.error(error);
        return res.end(JSON.stringify(error));
    }

    if (mockData.disabled) {
        return next();
    }

    if (req.method.toUpperCase() == 'OPTIONS') {
        if (!mockData.headers) {
            mockData.headers = {}
        }
        config.beforeResponse && config.beforeResponse(mockData, req);
        res.writeHead(200, mockData.headers);
        res.end('OPTIONS OK');
    }
    else {
        readPost(req, post => {
            var qs = req.query;
            parseBody(mockData, qs, post, req).then(body => {
                mockData.body = body;
                parseHeader(mockData, qs, post, req);

                config.beforeResponse && config.beforeResponse(mockData, req);
                console.log('mock:\t' + req.url);

                res.writeHead(mockData.status, mockData.headers);
                if (mockData.delay)
                    setTimeout(t => res.end(mockData.body), mockData.delay)
                else
                    res.end(mockData.body);
            }).catch(e => {
              res.writeHead(500, mockData.headers);
              res.end(String(e));
            });
        })
    }
}

function parseBody(mockData, qs, post, req) {
    return new Promise((resolve, reject) => {
        var body = mockData.body;
        if (typeof body == 'function') {
            callFn(body, mockData, qs, post, req)
                .then(toString)
                .catch(reject)
        }
        else toString(mockData.body)

        function toString(body) {
            if (typeof body == 'object') {
                body['!_IS_MOCK_DATA'] = true;
                try {
                  body = JSON.stringify(body, null, 4);
                }
                catch (e) {
                  console.error(e);
                  return reject('ERR in JSON data: ' + '\t' + e.toString())
                }
            }
            if (body === undefined || mockData === null) {
                body = '';
            }
            if (typeof body != 'string') {
                body = String(body);
            }
            resolve(body)
        }
    })
}

function parseHeader(mockData, qs, post, req) {
    var headers = mockData.headers;
    if (!headers) {
        headers = {};
    }
    else if (typeof headers == 'function') {
        try {
            headers = callFn(headers, mockData, qs, post, req);
        }
        catch (e) {
            console.error(e);
            headers = {};
        }
    }
    //默认值
    var defaultHeader = {
        'content-type': 'application/json; charset=utf-8',
        //"cache-control": 'no-cache',
    };
    if (!mockData.status) {
        mockData.status = 200;
    }
    mockData.headers = Object.assign({}, defaultHeader, headers);
}

function readPost(req, callback) {
    if (req.method == 'POST') {
        var qBody = '';
        req.on('data', function (data) {
            qBody += data;
        });

        req.on('end', function () {
            if (qBody) {
                try {
                    qBody = eval('(' + qBody + ')'); //尝试将json字符串转为对象
                }
                catch (e) {
                }
            }
            callback(qBody)
        });
    }
    else {
        callback({})
    }
}

function callFn(fn, mockData, qs, post, req) {
    try {
        var body = fn.call(mockData, qs, post, req.headers, req)
        if (body.then && body.catch) {
            return body
        }
        else
            return Promise.resolve(body);
    }
    catch (e) {
        var r = 'ERR in js func: ' + '\n' + fn.toString()
        console.error(e);
        return Promise.reject(r)
    }
}

function close() {
    if (server) {
        server.close();
        server = null
    }
}

module.exports = {
    start,
    checkStart,
    config,
    middleware(req, res, next) {
        onHandle(req, res)
    },
    close,
}