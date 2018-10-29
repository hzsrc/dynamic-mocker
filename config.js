const config = {
    mockEnabled: true,
    mockPath: './mockRoot', //模拟文件根目录
    proxyTarget: 'https://www.baidu.com',//后台接口服务地址（代理目标），为空表示不代理
    isHttps: false, //是否https
    port: 9085, //端口
    checkPath: function (urlPath) { //urlPath校验函数，返回true表示需要进行处理，为false直接走代理
        return urlPath.indexOf('/i/') > -1
    },
    beforeResponse: function (respData, req) { //数据返回前的回调钩子，respData包含status、headers、body属性
        //跨域调用ajax
        respData.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || req.headers['Origin'] || '';
        respData.headers['Access-Control-Allow-Credentials'] = 'true';
        respData.headers['Access-Control-Max-Age'] = '600';
        respData.headers['Access-Control-Allow-Headers'] = 'Content-Type,Content-Length,Authorization,Access,X-Requested-With,token,appid,businesstype';
        respData.headers['Access-Control-Allow-Methods'] = 'PUT,POST,GET,DELETE,PATCH,OPTIONS';

        respData.headers['P3P'] = 'CP="CAO PSA OUR"';

        if (!respData.delay) {
            respData.delay = 1000
        }
    },
    //映射处理文件。用于处理动态url。或是同一个url多个http method的情况。生成的参数可以放在require.query里面。
    mapFile(pathname, req) {
        var m = pathname.match(/(\/announcement)\/(\d+)/)
        if (m) {
            req.query.noticeId = m[2]
            return m[1]
        }
        return pathname
    }
}

module.exports = config;