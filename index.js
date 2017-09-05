var path = require('path'), fs = require('fs');
var url = require('url'), querystring =  require('querystring');
var yaml = require('js-yaml');
var createServer = require('./create-server.js')
var config =require('./config.js')

var proxy = require('http-proxy').createProxyServer({});
proxy.on('error', function (err, req, res, target) {
    console.log("[ERROR]:" + req.url + "\t" + err.message)
    res.end(err.message);
});
var _proxyHost = url.parse(config.proxyTarget).hostname;
//启动服务
createServer(config.isHttps, config.port, onHandle);


function onHandle(req, res) {
    var urlPart = url.parse(req.url);
    var pathname = urlPart.pathname;
    if (config.checkPath(pathname)) {
        //ajax请求
        var mockFile = path.join(config.mockPath, pathname + '.yml');
        if (fs.existsSync(mockFile)) {
            //模拟数据，从mock文件夹获取
            mockFn(req, res, mockFile, proxyWeb);
        }
        else {
            //非模拟数据的ajax请求，代理给服务处理
            proxyWeb();
        }
    }
    else {
        //return false
        //res.end('err');
        proxyWeb()
    }

    //由JSP或ASP.Net、PHP服务处理
    function proxyWeb() {
        console.log('proxy:\t' + pathname);
        req.headers.host = _proxyHost;//不设置的话，远程用ip访问会出错
        proxy.web(req, res, {target: config.proxyTarget});
    }
}

//使用yaml文件模拟内容输出
function mockFn(req, res, mockFile, next) {
    var ymlData = yaml.load(fs.readFileSync(mockFile)) || {};
    if (ymlData.disabled) {
        return next();
    }
    if (!ymlData.headers) {
        ymlData.headers = {};
    }
    if (!ymlData.headers['content-type']) {
        ymlData.headers['content-type'] = 'application/json; charset=utf-8';
    }
    if (!ymlData.headers['cache-control']) {
        ymlData.headers['cache-control'] = 'no-cache';
    }
    if (ymlData.status === undefined) {
        ymlData.status = 200
    }

    parseBody(ymlData, req, go);

    function go(body){
        console.log('mock:\t' + req.url);
        res.writeHead(ymlData.status, ymlData.headers);
        res.end(body);
    }
}

function parseBody(ymlData, req, callback){
	var body = ymlData.body;
    if (typeof body !== "string") {
        body = JSON.stringify(body, null, 2);
    }
    else{
        try {
            var val = eval("(" + body + ")");
            if(typeof val == 'function'){
                callYmlFunc(val, ymlData, req, go);
            }
            else {
                go(val)
            }
            return; //须返回，避免重复callback

            function go(ret){
                if (typeof ret != 'string'){
                    ret = JSON.stringify(ret);//为键名加上引号。同时可支持js函数、表达式，而不仅仅是json
                }
                callback(ret);
            }
        }
        catch (e) {//非json数据返回原样
        }
    }
    callback(body);
}

function callYmlFunc(fn, ymlData, req, callback){
    var qs = querystring.parse(url.parse(req.url).query);
    if(req.method == 'POST'){
      var qBody = '';
      req.on('data', function(data) {
        qBody += data;
      });

      req.on('end', function() {
        if(qBody){
            try{
                qBody = eval('('+qBody+')'); //尝试将json字符串转为对象
            }
            catch(e){}
        }
        callFn(qBody)
      });
    }
    else{
        callFn(null)
    }

    function callFn(qBody){
        try{
            var r = fn.call(ymlData, qs, qBody, req.headers, req);
        }
        catch(e){
            r = "ERR in yml func: " + e + "\n" + fn.toString()
        }
        callback(r);
    }
}