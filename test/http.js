const axios = require('axios')
var https = require('https')

https.globalAgent.options.rejectUnauthorized = false;
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //忽略任意证书错误

var myAxios = axios.create({
    //httpsAgent: new https.Agent({
    //    //ca: [require('fs').readFileSync(require('path').resolve(__dirname, '../ssl/ca.crt'), { encoding: 'utf-8' })],
    //    rejectUnauthorized: false // 忽略自签名证书错误
    //})
})

module.exports = function http(method, url, data) {
    return myAxios({
        method,
        url,
        data,
        secure: false,
    }).then(res => res.data || res || {})
}

module.exports.axios = myAxios
