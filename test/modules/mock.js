const http0 = require('../http')

function run(http) {
  test('mock func', () => {
    return http('post', 'http://localhost:8037/api/_func').then(res => {
      expect(res.data).toMatchObject({
        default: 'no data'
      })
    })
  })

  test('mock func post data', () => {
    return http('post', 'http://localhost:8037/api/_func', { type: 'test' }).then(res => {
      expect(res.data).toMatchObject({
        b: 'test'
      })
    })
  })


  test('mock json delayed', () => {
    var start = new Date()
    return http('post', 'http://localhost:8037/api/_json', { type: 'test' }).then(res => {
      expect(res.data).toMatchObject({
        ok: true
      })
      expect(new Date() - start).toBeGreaterThanOrEqual(500)
    })
  })

  test('mock json options', () => {
    return http.axios.options('http://localhost:8037/').then(res => {
      expect(res.headers['access-control-allow-credentials']).toMatch(/true/)
      expect(res.data).toMatch(/OPTIONS OK/)
    })
  })


  test('mock html', () => {
    return http('get', 'http://localhost:8037/').then(res => {
      expect(res.data || res).toMatch(/<h5>Mock<\/h5>/)
    })
  })
}

export default function () {
  run(http0)
}
export { run }
