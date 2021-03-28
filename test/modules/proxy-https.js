const http = require('../http')

// https
test('https proxy func', () => {
    return http('post', 'https://localhost:8443/api/_func').then(res => {
        expect(res.data).toMatchObject({
            default: 'no data'
        })
    })
})

test('https proxy func post data', () => {
    return http('post', 'https://localhost:8443/api/_func', { type: 'test' }).then(res => {
        expect(res.data).toHaveProperty('b', 'test')
    })
})


test('https proxy json delayed', () => {
    var start = new Date()
    return http('post', 'https://localhost:8443/api/_json', { type: 'test' }).then(res => {
        expect(res.data).toMatchObject({
            ok: true
        })
        expect(new Date() - start).toBeGreaterThanOrEqual(500)
    })
})


test('https proxy json options', () => {
    return http.axios.options('https://localhost:8443/api/_json').then(res => {
        //console.log(res.headers)
        //expect(res.headers['access-control-allow-credentials']).toMatch(/true/)
        expect(res.data).toMatch(/OPTIONS OK/)
    })
})

test('https DELETE dynamic url', () => {
    return http('delete', 'https://localhost:8443/api/delete/' + Math.random()).then(res => {
        expect(res.data || res).toMatch(/successfully deleted/)
    })
})
