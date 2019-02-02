// 实现将本地80端口代理到8092端口，配合hosts配置，用于调试微信（因为微信必须使用域名）
// 用法原理：https://www.cnblogs.com/hz-blog/p/wechat-local-debug-domain.html

const config = {
    mockEnabled: false, // 设置mock失效，使用proxy功能
    proxyTarget: false,  // 设置proxy失效，使用static功能
    static: {
        index:'index.html',
        path:'./'
    },
    isHttps: false, // 是否https
    port: 80 // 端口
}
module.exports = config
