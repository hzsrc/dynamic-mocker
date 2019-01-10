const config = {
    mockEnabled: true,
    mockPath: ['mockRoot'], //模拟文件根目录
    proxyTarget: '//www.abc.com', //后台接口服务地址（代理目标），为空表示不代理
    isHttps: false, //是否https
    port: 8037, //端口
    checkPath: function (urlPath) { //urlPath校验函数，返回true表示需要进行mock处理，为false直接走代理
        return true
    },
    beforeResponse: function (respData, req) { //数据返回前的回调钩子，respData包含status、headers、body属性
        respData.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || req.headers['Origin'] || '';
        respData.headers['Access-Control-Allow-Credentials'] = 'true';
        respData.headers['Access-Control-Allow-Headers'] = req.headers['access-control-request-headers'] || req.headers['Access-Control-Request-Headers'] || '';
        respData.headers['Access-Control-Max-Age'] = '6000';
        respData.headers["Access-Control-Allow-Methods"] = "PUT,POST,GET,DELETE,PATCH,OPTIONS";

        respData.headers['P3P'] = 'CP="CAO PSA OUR"';

        // if (!respData.delay) {
        //     respData.delay = 1000 // 所以mock都延迟1000ms返回
        // }
    },
    //映射处理文件。用于处理动态url，比如：/delete-article/233 。生成的参数可以放在req.query里面。
    mapFile(pathname, req) {
        var m = pathname.match(/(\/delete\-article)\/(\d+)/)
        if (m) {
            req.query.articleId = m[2]
            return m[1]
        }
        return pathname
    }
}
module.exports = config;
