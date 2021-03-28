var path = require('path')
var fs = require('fs')
var url = require('url')
var querystring = require('querystring')
var mockByData = require('./mockByData.js')


function byMock(config, req, res, next) {
    if (config.mockEnabled) {
        var urlPart = url.parse(req.url);
        req.query = querystring.parse(urlPart.query) //暂存备用

        var pathname = urlPart.pathname;
        if (config.mapFile) {
            pathname = config.mapFile(pathname, req)
        }
        if (!config.checkPath || config.checkPath(pathname)) {
            var paths = [].concat(config.mockPath);

            var i = -1;
            var byNextPath = function () {
                i++;
                if (i < paths.length) {
                    var mockFile = path.join(config.relativePath, paths[i], pathname + '.js');
                    if (fs.existsSync(mockFile)) {
                        //模拟数据，从mock文件夹获取
                        mockByFile(config, req, res, mockFile, byNextPath);
                    } else {
                        // 像`/api/delete/[id]`，这样的动态url走 `__DEFAULT.js`，设置query.ThisUrlPart=[id]
                        mockFile = path.join(config.relativePath, paths[i], path.dirname(pathname), '__DEFAULT.js');
                        if (fs.existsSync(mockFile)) {
                            req.query.ThisUrlPart = path.basename(pathname)
                            mockByFile(config, req, res, mockFile, byNextPath);
                        } else {
                            byNextPath()
                        }
                    }
                } else {
                    //没有mock数据，代理给服务处理
                    next();
                }
            };
            byNextPath();
        }
    } else {
        next()
    }
}


//使用js文件模拟内容输出
function mockByFile(config, req, res, mockFile, byNextPath) {
    var fullMockFile = path.resolve(config.relativePath, mockFile);
    var responseFn = function (status, headers, body) {
        res.writeHead(status, headers);
        return res.end(body);
    }
    try {
        try {
            // jest会覆盖当前的require，故需要global
            delete global.require.cache[fullMockFile]; //根据绝对路径，清空缓存的对象
            var mockData = global.require(fullMockFile) || {};
            if (req.url.toString().indexOf('_func') > -1) console.log(1111111, typeof mockData.body)
        } catch (e) {
            var js = '(function(){var exports={},module={exports:exports};' + fs.readFileSync(fullMockFile) + ';return module.exports})()';
            mockData = eval(js)
        }
        req.readReqData = readPost.bind(null, req)
        return mockByData(config, mockData, req, responseFn, byNextPath)
    } catch (e) {
        var error = `Error in file:${mockFile}:\n` + e;
        console.error(error);
        responseFn(500, {}, JSON.stringify(error));
    }
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
                } catch (e) {
                }
            }
            callback(qBody)
        });
    } else {
        callback({})
    }
}

module.exports = byMock

