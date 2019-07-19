import MockXhr from './xhr'
import mockByData from '../mockByData'

export default {
  setup(config, importJs) {
    window.XMLHttpRequest = MockXhr
    MockXhr.setup({
      find(custom) {
        if (!config.mockEnabled && config.samePreview) {
          // 返回null走实际的ajax
          return null
        }
        var urlObj = new UrlLite(custom.options.url || '')
        var url = urlObj.pathname
        return importJs(url)
          .catch(e => {
            var last = url.lastIndexOf('/')
            if (last > -1) {
              var baseName = url.slice(0, last)
              urlObj.query.ThisUrlPart = url.slice(last + 1)
              return importJs(baseName + '/__DEFAULT')
            } else {
              throw e
            }
          })
          .then(r => {
            var mockData = r.default || r
            mockData.urlObj = urlObj
            return mockData.disabled && config.samePreview ? null : mockData
          })
          .catch(e => {
            return null
          })
      },
      doResponse(custom) {
        var mockData = custom.template
        var urlObj = mockData.urlObj
        // 模拟req对象
        var req = {
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
            }
          }
        }
        return new Promise((resolve, reject) => {
          function fnResponse(status, headers, body) {
            resolve({ status, headers, body })
          }

          function next() {
            resolve(null)
          }

          return mockByData(config, mockData, req, fnResponse, next)
        })
      }
    })
  }
}
//
// function getProxyTarget(urlPart, proxyTarget) {
//     if (typeof proxyTarget === 'function') {
//         return proxyTarget(urlPart)
//     }
//     return proxyTarget
// }

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
