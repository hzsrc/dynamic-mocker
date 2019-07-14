const http = require('../http')

// https
test('https mock func', () => {
    return http('post', 'https://localhost/api/_func').then(res => {
        expect(res.data).toMatchObject({
            default: 'no data'
        })
    })
})

test('https mock func post data', () => {
    return http('post', 'https://localhost/api/_func', { type: 'test' }).then(res => {
        expect(res.data).toMatchObject({
            b: 'test'
        })
    })
})


test('https mock json delayed', () => {
    var start = new Date()
    return http('post', 'https://localhost/api/_json', { type: 'test' }).then(res => {
        expect(res.data).toMatchObject({
            ok: true
        })
        expect(new Date() - start).toBeGreaterThanOrEqual(2000)
    })
})
