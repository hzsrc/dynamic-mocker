var path = require('path')
var fs = require('fs')
var url = require('url')
var querystring = require('querystring')
var getConfig = require('./getConfig.js')

function byMock(req, res, next) {
    config = getConfig()
    if (config.mockEnabled) {
        var urlPart = url.parse(req.url);
        req.query = querystring.parse(urlPart.query) //暂存备用

        var pathname = urlPart.pathname;
        if (config.mapFile) {
            pathname = config.mapFile(pathname, req)
        }
        if (config.checkPath(pathname)) {
            var paths = config.mockPath;
            if (typeof paths == 'string') {
                paths = [paths];
            }
            var i = -1;
            var byNextPath = function () {
                i++;
                if (i < paths.length) {
                    var mockFile = path.join(paths[i], pathname + '.js');
                    if (fs.existsSync(mockFile)) {
                        //模拟数据，从mock文件夹获取
                        mockByFile(config, req, res, mockFile, byNextPath);
                    }
                    else {
                        byNextPath()
                    }
                }
                else {
                    //没有mock数据，代理给服务处理
                    next();
                }
            };
            byNextPath();
        }
    }
    else {
        next()
    }
}


//使用js文件模拟内容输出
function mockByFile(config, req, res, mockFile, byNextPath) {
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
        return byNextPath();
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
            if (body instanceof Buffer) {
                return resolve(body)
            }
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

module.exports = byMock