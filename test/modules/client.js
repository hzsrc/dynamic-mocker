import client from '../../src/client'
import XMLHttpRequest from '../../src/client/xhr'
import { run } from './mock'

const config = require('../../demo/mock_proxy/config')

client.setup(config, pathname => new Promise((resolve, reject) => {
  resolve(require('../../demo/mock_proxy/root' + pathname + '.js'))
}))

http.axios = {}
'get,put,post,delete,options'.split(',').map(method => {
  http.axios[method] = function (url, data) {
    return http('options', url, data)
  }
})

run(http)


function http(method, url, data) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open(method, url);
    request.send(data);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          var data = request.responseText
          var contentType = request.getResponseHeader('content-type') || ''
          if (contentType.indexOf('/json') > -1) {
            try {
              data = JSON.parse(data)
              data = data && data.data
            } catch (e) {
            }
          }
          resolve({
            status: request.status,
            data,
            headers: toHeaderObj(request.getAllResponseHeaders())
          })
        } else {
          /*eslint-disable-next-line*/
          reject({ status: request.status });
        }
      }
    }
    request.onerror = reject
  })
}

function toHeaderObj(str) {
  var r = {}
  str.split(/\r\n/g).map(item => {
    var ns = item.split(/\:\s*/g)
    r[ns[0].toLowerCase()] = ns[1]
  })
  return r
}
