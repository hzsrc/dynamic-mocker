const http0 = require('../http')

function run(http, prefix) {
    test(prefix + 'mock func', () => {
        return http('post', 'http://localhost:8037/api/_func').then(res => {
            expect(res.data).toMatchObject({
                default: 'no data'
            })
        })
    })

    test(prefix + 'mock func post data', () => {
        return http('post', 'http://localhost:8037/api/_func', { type: 'test' }).then(res => {
            expect(res.data).toHaveProperty('b', 'test')
        })
    })


    test(prefix + 'mock json delayed', () => {
        var start = new Date()
        return http('post', 'http://localhost:8037/api/_json', { type: 'test' }).then(res => {
            expect(res.data).toMatchObject({
                ok: true
            })
            expect(new Date() - start).toBeGreaterThanOrEqual(500)
        })
    })

    test(prefix + 'mock json options', () => {
        return http.axios.options('http://localhost:8037/api/_json').then(res => {
            //var headers = JSON.stringify(res.headers)
            //expect(headers).toMatch('"access-control-allow-credentials":"true"')
            expect(res.data).toMatch(/OPTIONS OK/)
        })
    })

    test(prefix + 'DELETE dynamic url', () => {
        return http('delete', 'http://localhost:8037/api/delete/' + Math.random()).then(res => {
            expect(res.data || res).toMatch(/successfully deleted/)
        })
    })

    test(prefix + 'mock html', () => {
        return http('get', 'http://localhost:8037/').then(res => {
            expect(res.data || res).toMatch(/<h5>Mock<\/h5>/)
        })
    })

}

export default function () {
    run(http0, '')
}
export { run }
