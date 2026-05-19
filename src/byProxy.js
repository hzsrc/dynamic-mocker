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
    proxy.on('proxyRes', function (proxyRes, req, res) {
        // 监听客户端（浏览器）断开连接事件
        req.on('close', destroy);
        // 监听代理响应流异常关闭，避免残留
        res.on('close', destroy);

        function destroy() {
            if (proxyRes && !proxyRes.destroyed) {
                proxyRes.destroy(); // 强制释放与后端的连接
            }
        }
    });
    return proxy
}

// 由JSP或ASP.Net、PHP服务处理
function proxyByWeb(config, proxy, req, res, next) {
    var options = Object.assign({
        ws: true,
        timeout: 60000, // 代理请求超时
        proxyTimeout: 60000, // 后端响应超时
        xfwd: true // 转发原始请求头，避免 HMR 丢失 host/origin
    }, config.proxyOptions);
    if (req.headers['proxy-connection']) {
        //代理服务器模式
        if (!proxy) proxy = getProxy(proxy, options);
        console.log('proxy:\t=>\t' + req.url);
        req.headers['connection'] = req.headers['proxy-connection'];
        delete req.headers['proxy-connection'];
        proxy.web(req, res, { target: req.url });
        return proxy;
    } else {
        // 明确指定 keep-alive，避免代理层丢失导致后端误判
        req.headers['connection'] = 'keep-alive';
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

        console.log('proxy:\t' + urlPart.pathname + '\t=>\t' + target + urlPart.path);
        //req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
        proxy.web(req, res, { target: target });
        return proxy
    } else {
        next()
    }
}

module.exports = proxyByWeb