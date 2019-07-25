//var getConfig = require('./getConfig.js')

//使用js文件模拟内容输出
function mockByData(config, mockData, req, fnResponse, byNextPath) {
    /*
        req = {
            method: String,
            url: String,
            query: Object,
            headers: Object,
            getData: Function(callback)
        }
        fnResponse: Function(status, headers, body)
    */
    if (mockData.disabled) {
        return byNextPath();
    }

    if (req.method.toUpperCase() == 'OPTIONS') {
        if (!mockData.headers) {
            mockData.headers = {}
        }
        config.beforeResponse && config.beforeResponse(mockData, req);
        fnResponse(200, mockData.headers, 'OPTIONS OK');
    } else {
        req.readReqData(post => {
            var qs = req.query;
            parseBody(mockData, qs, post, req).then(body => {
                mockData.body = body;
                parseHeader(mockData, qs, post, req);

                config.beforeResponse && config.beforeResponse(mockData, req);

                if (mockData.delay)
                    setTimeout(t => fnResponse(mockData.status, mockData.headers, mockData.body), mockData.delay)
                else
                    fnResponse(mockData.status, mockData.headers, mockData.body);
            }).catch(e => {
                fnResponse(500, mockData.headers, String(e));
            });
        })
    }
}

function parseBody(mockData, qs, post, req) {
    return new Promise((resolve, reject) => {
        var body = mockData.body;
        if (typeof body === 'function') {
            callFn(body, mockData, qs, post, req)
                .then(toString)
                .catch(reject)
        } else toString(mockData.body)

        function toString(body) {
            if (body instanceof Buffer) {
                return resolve(body)
            }
            if (typeof body === 'object') {
                body['!_IS_MOCK_DATA'] = true;
                try {
                    body = JSON.stringify(body, null, 4);
                } catch (e) {
                    console.error(e);
                    return reject(new Error('ERR in JSON data: ' + '\t' + e.toString()))
                }
            }
            if (body === undefined || mockData === null) {
                body = '';
            }
            if (typeof body !== 'string') {
                body = String(body);
            }
            resolve(body)
        }
    })
}

function parseHeader(mockData, qs, post, req) {
    var headers = mockData.headers;
    if (typeof headers === 'function') {
        try {
            headers = callFn(headers, mockData, qs, post, req);
        } catch (e) {
            console.error(e);
            headers = {};
        }
    }
    if (!headers) {
        headers = {};
    }
    //默认值
    var defaultHeader = {
        'content-type': 'application/json; charset=utf-8',
    //"cache-control": 'no-cache',
    };
    if (!mockData.status) {
        mockData.status = 200;
    }
    mergeHeader(headers, defaultHeader);
    mockData.headers = headers
}

// Header不区分大小写
function mergeHeader(target, merge) {
    var map = {}
    Object.keys(target).map(name => {
        map[name.toLowerCase()] = 1
    })
    Object.keys(merge).map(name => {
        if (!map[name.toLowerCase()]) {
            target[name] = merge[name]
        }
    })
}

function callFn(fn, mockData, qs, post, req) {
    try {
        var body = fn.call(mockData, qs, post, req.headers, req)
        if (body.then && body.catch) {
            return body
        } else
            return Promise.resolve(body);
    } catch (e) {
        var r = 'ERR in js func: ' + '\n' + fn.toString()
        console.error(e);
        return Promise.reject(r)
    }
}

module.exports = mockByData
