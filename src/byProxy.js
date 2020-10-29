var url = require('url');


function getProxyTarget(urlPart, proxyTarget) {
    if (typeof proxyTarget === 'function') {
        return proxyTarget(urlPart)
    }
    return proxyTarget
}

function getProxy(proxy) {
    proxy = require('http-proxy').createProxyServer({});
    proxy.on('error', function (err, req, res, target) {
        console.log('[ERROR]:' + (req && req.url) + '\t' + err.message)
        if(res) res.end(err.message);
    });
    return proxy
}

// 由JSP或ASP.Net、PHP服务处理
function proxyByWeb(config, proxy, req, res, next) {
	if(req.headers["proxy-connection"]){
        //代理服务器模式
		if (!proxy) proxy = getProxy();
		console.log('proxy:\t=>\t' + req.url);
		req.headers["connection"] = req.headers["proxy-connection"];
		delete req.headers["proxy-connection"];
		proxy.web(req, res, { target: req.url });
		return proxy;
	}
    if (config.proxyTarget) {
        if (!proxy) proxy = getProxy()
        var urlPart = url.parse(req.url);
        var target = getProxyTarget(urlPart, config.proxyTarget);
        console.log('proxy:\t' + urlPart.pathname + '\t=>\t' + target + urlPart.pathname);
        req.headers.host = url.parse(target).hostname; //不设置的话，远程用ip访问会出错
        proxy.web(req, res, { target: target });
        return proxy
    } else {
        next()
    }
}

module.exports = proxyByWeb
