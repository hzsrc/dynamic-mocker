var url = require('url');


function getProxyTarget(urlPart, proxyTarget) {
    if (typeof proxyTarget === 'function') {
        return proxyTarget(urlPart)
    }
    return proxyTarget
}

function getProxy(proxy, options) {
    options = Object.assign({}, options);
    proxy = require('http-proxy').createProxyServer(options);
    proxy.on('error', function (err, req, res, target) {
        console.log('[ERROR]:' + (req && req.url) + '\t' + err.message)
        if (res) res.end(err.message);
    });
    return proxy
}

// 由JSP或ASP.Net、PHP服务处理
function proxyByWeb(config, proxy, req, res, next) {
    if (req.headers['proxy-connection']) {
        //代理服务器模式
        if (!proxy) proxy = getProxy(proxy, config.proxyOptions);
        console.log('proxy:\t=>\t' + req.url);
        req.headers['connection'] = req.headers['proxy-connection'];
        delete req.headers['proxy-connection'];
        proxy.web(req, res, { target: req.url });
        return proxy;
    }
    if (config.proxyTarget) {
        if (!proxy) proxy = getProxy(proxy, config.proxyOptions)
        var urlPart = url.parse(req.url);
        urlPart.setChanged = function (path) {
            this._changed = 1
        }
        var target = getProxyTarget(urlPart, config.proxyTarget);
        if (urlPart._changed) {
            req.url = url.format(urlPart)
        }
        console.log('proxy:\t' + urlPart.pathname + '\t=>\t' + target + urlPart.pathname);
        //req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
        proxy.web(req, res, { target: target });
        return proxy
    } else {
        next()
    }
}

module.exports = proxyByWeb
