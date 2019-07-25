const http = require('../http')


test('static html', () => {
    return http('get', 'http://localhost:8010/').then(res => {
        expect(res).toMatch(/<img src="a\.gif">/)
    })
})

test('static js', () => {
    return http('get', 'http://localhost:8010/app.js', { type: 'test' }).then(res => {
        expect(res).toMatch(/alert\('hello~'\)/)
    })
})
