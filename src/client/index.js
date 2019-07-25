import MockXhr from './xhr'
import mockByData from '../mockByData'

export default {
    setup(config, mockDataMap) {
        this._xhr = window.XMLHttpRequest
        window.XMLHttpRequest = MockXhr
        if (!config) return
        if (!config.samePreview) config.mockEnabled = true
        MockXhr.setup({
            find(custom) {
                if (!config.mockEnabled) {
                    // 返回null走实际的ajax
                    return null
                }
                var urlObj = new UrlLite(custom.options.url || '')
                var mockData = getMockData(urlObj, mockDataMap);
                if (mockData) {
                    mockData = Object.assign({}, mockData)
                    mockData.urlObj = urlObj
                    if (!config.samePreview) {
                        mockData.disabled = false
                    }
                    if (!mockData.disabled) {
                        return mockData
                    }
                }

                if (config.logData) {
                    console.log('Ajax(not found):\t' + urlObj.pathname)
                }
                return null
            },
            doResponse(custom) {
                var mockData = custom.template
                var urlObj = mockData.urlObj
                var req = getRequest(custom, urlObj)
                return new Promise((resolve, reject) => {
                    return mockByData(config, mockData, req, fnResponse, next)

                    function fnResponse(status, headers, body) {
                        resolve({ status, headers, body })
                        doLog(body, status, headers);
                    }

                    function next() {
                        if (config.logData) {
                            console.log('Ajax(disabled):\t' + urlObj.pathname)
                        }
                        resolve(null)
                    }

                    function doLog(body, status, headers) {
                        if (config.logData) {
                            try {
                                var bodyObj = JSON.parse(body)
                            } catch (e) {
                                bodyObj = body
                            }
                            console.log(urlObj.pathname, req, { status, headers, body: bodyObj })
                        }
                    }
                })
            }
        })
    },
    cancel() {
        window.XMLHttpRequest = this._xhr
    }
}
//
// function getProxyTarget(urlPart, proxyTarget) {
//     if (typeof proxyTarget === 'function') {
//         return proxyTarget(urlPart)
//     }
//     return proxyTarget
// }


function getMockData(urlObj, mockDataMap) {
    var pathname = urlObj.pathname
    var mockData = mockDataMap[pathname]
    if (!mockData) {
        var last = pathname.lastIndexOf('/')
        if (last > -1) {
            var dirName = pathname.slice(0, last)
            urlObj.query.ThisUrlPart = pathname.slice(last + 1)
            mockData = mockDataMap[dirName + '/__DEFAULT']
        }
    }
    return mockData;
}

// 模拟req对象
function getRequest(custom, urlObj) {
    return {
        method: custom.method,
        url: urlObj.pathname,
        query: urlObj.query,
        headers: custom.requestHeaders,
        readReqData(callback) {
            if (custom.method.toLowerCase() === 'get') {
                callback({})
            } else {
                var body = custom.options.body
                try {
                    body = JSON.parse(body)
                } catch (e) {

                }
                callback(body)
                this.data = body
            }
        }
    };
}

function UrlLite(url) {
    var pos = url.indexOf('//')
    if (pos > -1) {
        var pos2 = url.indexOf('/', pos + 3)
        if (pos2 > -1) {
            this.origin = url.slice(0, pos2)
            url = url.slice(pos2)
        }
    }
    var query = {}
    var idx = url.indexOf('?')
    if (idx > -1) {
        this.pathname = url.slice(0, idx)
        var queryStrs = url.slice(idx + 1).split('&')
        queryStrs.map(q => {
            var qs = q.split('=')
            query[qs[0]] = decodeURIComponent(qs[1])
        })
    } else {
        this.pathname = url
    }
    this.query = query
}
