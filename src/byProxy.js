var url = require('url');
var getConfig = require('./getConfig.js')
var config, proxy;

function getProxyTarget(urlPart, proxyTarget) {
  if (typeof proxyTarget === 'function') {
    return proxyTarget(urlPart)
  }
  return proxyTarget
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

//由JSP或ASP.Net、PHP服务处理
function proxyByWeb(req, res, next) {
  config = getConfig()
  var urlPart = url.parse(req.url);
  if (config.proxyTarget) {
    var target = getProxyTarget(urlPart, config.proxyTarget);
    console.log('proxy:\t' + urlPart.pathname + '\t=>\t' + target + urlPart.pathname);
    req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
    getProxy().web(req, res, { target: target });
  } else {
    next()
  }
}

module.exports = proxyByWeb
