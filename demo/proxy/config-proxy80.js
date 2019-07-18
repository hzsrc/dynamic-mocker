// 实现将本地80端口代理到8092端口，配合hosts配置，用于调试微信（因为微信必须使用域名）
// 用法原理：https://www.cnblogs.com/hz-blog/p/wechat-local-debug-domain.html

const config = {
  mockEnabled: false, // 设置mock失效，仅使用proxy功能
  proxyTarget: function (urlPart) {
    return 'http://localhost:8037'
  },
  isHttps: true, // 是否https
  port: 80 // 端口
}
module.exports = config
