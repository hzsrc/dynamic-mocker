import client from '../../src/client'
import XMLHttpRequest from '../../src/client/xhr'
import { run } from './mock'

const config = require('../../demo/mock_proxy/config')

client.setup(config, pathname => new Promise((resolve, reject) => {
  resolve(require('../../demo/mock_proxy/root' + pathname + '.js'))
}))


http.axios = {
  options(url) {
    return http('options', url)
  }
}

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
          var contentType = request.getResponseHeader('content-type')
          if (contentType.indexOf('/json') > -1) {
            data = JSON.parse(data)
            data = data && data.data
          }
          resolve({
            status: request.status,
            data,
            headers: request.getAllResponseHeaders()
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
