var url = require('url');


function getProxyTarget(urlPart, proxyTarget) {
    if (typeof proxyTarget === 'function') {
        return proxyTarget(urlPart)
    }
    return proxyTarget
}

function getProxy(proxy, options) {
    proxy = require('http-proxy').createProxyServer(options);
    proxy.on('error', function (err, req, res, target) {
        console.log('[ERROR]:' + (req && req.url) + '\t' + err.message)
        if (res) res.end(err.message);
    });
    return proxy
}

// 由JSP或ASP.Net、PHP服务处理
function proxyByWeb(config, proxy, req, res, next) {
    var options = Object.assign({ ws: true }, config.proxyOptions);
    if (req.headers['proxy-connection']) {
        //代理服务器模式
        if (!proxy) proxy = getProxy(proxy, options);
        console.log('proxy:\t=>\t' + req.url);
        req.headers['connection'] = req.headers['proxy-connection'];
        delete req.headers['proxy-connection'];
        proxy.web(req, res, { target: req.url });
        return proxy;
    }
    if (config.proxyTarget) {
        if (!proxy) proxy = getProxy(proxy, options)
        var urlPart = url.parse(req.url);
        urlPart.setChanged = function (path) {
            this._changed = 1
        }
        var target = getProxyTarget(urlPart, config.proxyTarget);
        if (urlPart._changed) {
            req.url = url.format(urlPart)
        }

        //webSocket特殊处理
        var wsUrlReg = config.wsUrlReg || /__webpack_hmr/
        //处理 WebSocket 升级请求
        proxy.on('upgrade', (req, socket, head) => {
            console.log('upgrade: ' + req.url)
            // 只代理 Webpack HMR 的 WebSocket 请求
            if (req.url.match(wsUrlReg)) {
                proxy.ws(req, socket, head, {
                    target: target.replace(/^https?/, 'ws'),
                    ...options
                });
            }
        });


        console.log('proxy:\t' + urlPart.pathname + '\t=>\t' + target + urlPart.pathname);
        //req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
        proxy.web(req, res, { target: target });
        return proxy
    } else {
        next()
    }
}

module.exports = proxyByWeb
