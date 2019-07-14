const exec = require('child_process').exec
const axios = require('axios')
beforeAll(callback => {
    var option = {
        maxBuffer: 10240000
    }
    exec('npm run mock', option, callback, (error, stdout, stderr) => {

    })
    exec('npm run proxy80', option, callback, (error, stdout, stderr) => {

    })

})

test('mock', t => http('get', 'http://localhost:8037/_func').then(res => {
    JSON.stringify(res.data).toMatch(/data: \S+/)
}))

function http(method, url, data) {
    return axios({
        method,
        url,
        data
    })
}
