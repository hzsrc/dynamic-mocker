const config = {
    mockEnabled: true,
    mockPath: ['root'], //模拟文件根目录
    proxyTarget(urlPart) {
        if (urlPart.path.slice(0, 2) === '/s') {
            return 'https://www.baidu.com'
        }
        return 'https://api.github.com'
    }, //后台接口服务地址（代理目标），为空表示不代理
    proxyOptions: {
        changeOrigin: true
    },
    isHttps: false, //是否https
    port: 8037, //端口
    // checkPath: function (urlPath) { //urlPath校验函数，返回true表示需要进行mock处理，为false直接走代理
    //     return urlPath ===  'api'
    // },
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
    //映射处理文件。用于处理动态url，比如：/delete-article/233 。生成的参数可以放在req.query里面。
    // mapFile(pathname, req) {
    //     var m = pathname.match(/(\/delete\-article)\/(\d+)/)
    //     if (m) {
    //         req.query.articleId = m[2]
    //         return m[1]
    //     }
    //     return pathname
    // },
    samePreview: false, // true - mock预览时disabled开关也生效（默认false,预览时忽略所有开关）
    logData: false, // mock预览时打印模拟数据
    // genClientJs: '../client_preview/src/utils/mockClient.js', // 生成mockClient.js, 默认在配置文件所在的目录
}
module.exports = config;
