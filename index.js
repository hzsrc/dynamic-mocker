var path = require('path'), fs = require('fs');
var url = require('url'), querystring =  require('querystring');
//var yaml = require('js-yaml');
var createServer = require('./create-server.js')
var config = (function(){
	var fn = process.argv[2];
	var fn = fn ? path.resolve(fn) : './config.js';
	return require(fn);
}) ()

var proxy = require('http-proxy').createProxyServer({});
proxy.on('error', function (err, req, res, target) {
    console.log("[ERROR]:" + req.url + "\t" + err.message)
    res.end(err.message);
});
var _proxyHost = url.parse(config.proxyTarget).hostname;

//启动服务
process.title = "dyn-mocker";
console.log('Mock root path: ' + path.resolve(config.mockPath))
createServer(config.isHttps, config.port, onHandle);

function onHandle(req, res) {
    var urlPart = url.parse(req.url);
    var pathname = urlPart.pathname;
    if (config.mockEnabled && config.checkPath(pathname)) {
        //ajax请求
        var mockFile = path.join(config.mockPath, pathname + '.js');
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
    	if(config.proxyTarget){
	        console.log('proxy:\t' + pathname);
	        req.headers.host = _proxyHost;//不设置的话，远程用ip访问会出错
	        proxy.web(req, res, {target: config.proxyTarget});
	    }
	    else{
            var resp ={headers: {}}
            config.beforeResponse && config.beforeResponse(resp, req);
	    	res.writeHead(404, resp.headers);
        	res.end('NOT FOUND');
	    }
    }
}

//使用yaml文件模拟内容输出
function mockFn(req, res, mockFile, next) {
    var js = '(function(){var exports={},module={exports:exports};'+ fs.readFileSync(mockFile) + ';return module.exports})()';
    var mockData = eval(js) || {};
    if (mockData.disabled) {
        return next();
    }

    readPost(req, post =>{
        var qs = querystring.parse(url.parse(req.url).query);
        parseBody(mockData, qs, post, req)
        parseHeader(mockData, qs, post, req);

        config.beforeResponse && config.beforeResponse(mockData, req);
        console.log('mock:\t' + req.url);

        res.writeHead(mockData.status, mockData.headers);
        res.end(mockData.body);
    })
}

function parseBody(mockData, qs, post, req){
	var body = mockData.body;
    if (typeof body !== "function") {
        mockData.body = JSON.stringify(body, null, 4);
    }
    else{
        try {
            body = callFn(body, mockData, qs, post, req);
            mockData.body = JSON.stringify(body, null, 4);
        }
        catch (e) {//非json数据返回原样
        }
    }
}

function parseHeader(mockData, qs, post, req){
    var headers = mockData.headers;
    if (!headers) {
        headers = {};
    }
    else if(typeof headers == 'function'){
        try{
            headers = callFn(headers, mockData, qs, post, req);
        }
        catch(e){
            console.error(e);
            headers = {};
        }
    }
    //默认值
    var defaultHeader = {
        "content-type": 'application/json; charset=utf-8',
        //"cache-control": 'no-cache',
    };
    if(!mockData.status){
        mockData.status = 200;
    }
    mockData.headers = Object.assign({}, defaultHeader, headers);
}

function readPost(req, callback){
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
        callback(qBody)
      });
    }
    else{
        callback({})
    }
}

function callFn(fn, mockData, qs, post, req){
    try{
        return fn.call(mockData, qs, post, req.headers, req);
    }
    catch(e){
        r = "ERR in js func: " + "\n" + fn.toString()
        console.error(e);
    }
}