// 将一个目录作为http服务启动

const config = {
    mockEnabled: false, // 设置mock失效，使用proxy功能
    proxyTarget: false, // 设置proxy失效，使用static功能
    static: {
        index: 'index.html',
        path: './root'
    },
    isHttps: false, // 是否https
    port: 8010, // 端口

    // 非CORS接口不用加beforeResponse
    beforeResponse: function (respData, req) { //数据返回前的回调钩子，respData包含status、headers、body属性
        respData.headers['access-control-allow-origin'] = req.headers['origin'] || req.headers['Origin'] || '';
        respData.headers['access-control-allow-credentials'] = 'true';
        respData.headers['access-control-allow-headers'] = req.headers['access-control-request-headers'] || req.headers['Access-Control-Request-Headers'] || '';
        respData.headers['access-control-max-age'] = '6000';
        respData.headers['access-control-allow-methods'] = 'PUT,POST,GET,DELETE,PATCH,OPTIONS';

        respData.headers['P3P'] = 'CP="CAO PSA OUR"';

        // if (!respData.delay) {
        //     respData.delay = 1000 // 所以mock都延迟1000ms返回
        // }
    },
}
module.exports = config
