// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 忽略任意证书错误

const axios = require('axios')
var https = require('https')
var myAxios = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false // 忽略自签名证书错误
    })
})

module.exports = function http(method, url, data) {
    return myAxios({
        method,
        url,
        data,
        secure: false,
    }).then(res => res.data || res || {})
}
