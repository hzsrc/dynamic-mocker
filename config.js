const path = require('path');
module.exports = {
	mockPath : process.argv[2] || './mockRoot', //模拟文件根目录
    //proxyTarget : 'http://localhost:2011',//后台接口服务地址（代理目标）
    proxyTarget : '',//后台接口服务地址（代理目标）
    isHttps: false,
	port : process.argv[3] || 8085, //端口
    checkPath : function(urlPath) { //urlPath校验函数，返回true表示需要进行处理
	    if(urlPath.indexOf('/i/') > -1) return true
	    var ext = path.extname(urlPath);
	    return ext.indexOf('.as') == 0 || ext == '.axd' //aspx、ashx、asmx等
	}
}
