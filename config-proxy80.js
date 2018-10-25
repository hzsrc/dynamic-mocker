// 实现将本地80端口代理到9998端口，配合hosts配置将域名映射到127.0.0.1，可用于微信调试本地代码（因为微信必须使用域名）

const config = {
  mockEnabled: false,
  proxyTarget: function(urlPart) {
    return 'http://localhost:9998'
  },
  isHttps: false, // 是否https
  port: 80 // 端口
}
module.exports = config
