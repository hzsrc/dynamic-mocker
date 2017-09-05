const path = require('path');
module.exports = {
	mockPath : './mockRoot', //模拟文件根目录
    proxyTarget : 'http://localhost:2011',//后台接口服务地址（代理目标），为空表示不代理
    isHttps: false, //是否https
	port : 8085, //端口
    checkPath : function(urlPath) { //urlPath校验函数，返回true表示需要进行处理，为false直接走代理
	    if(urlPath.indexOf('/i/') > -1) return true
	    var ext = path.extname(urlPath);
	    return /\.as\wx|\.axd|\.jsp/i.test(ext) //aspx、ashx、asmx、axd、jsp等
	}
}
