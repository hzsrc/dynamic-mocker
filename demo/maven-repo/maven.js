// 实现maven仓库转发

const config = {
    mockEnabled: false,
    proxyTarget: function (urlPart) {
        return 'https://repo1.maven.org/maven2' //https://app.camunda.com/nexus/content/groups/public
    },
    mockOptions: { followRedirects: true },
    isHttps: true, // 是否https
    port: 8099 // 端口
}
module.exports = config
